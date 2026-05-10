require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const pool = require('./db/postgres');
const { setSession, getSession, deleteSession } = require('./db/redis');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatQuestion(q, number, total) {
  return {
    id: q.id,
    number,
    total,
    text: q.question_text,
    options: { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d },
  };
}

function buildRecommendations(wrongCount, topicName, difficulty) {
  if (wrongCount === 0) {
    return [{ topic: '🏆 Perfect Score!', reason: `Every ${topicName} ${difficulty} question correct. Try a harder level next!` }];
  }
  if (wrongCount <= 3) {
    return [{ topic: `📖 Review ${topicName} (${difficulty})`, reason: `You got ${wrongCount} question(s) wrong. Re-read each explanation, then retry.` }];
  }
  return [
    { topic: `📖 More ${topicName} Practice`, reason: `You got ${wrongCount} questions wrong. Work through each explanation carefully.` },
    { topic: '💡 Tip', reason: 'Write your working step-by-step before choosing an answer.' },
  ];
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/topics
app.get('/api/topics', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, description, icon, color FROM topics ORDER BY id'
    );
    const counts = await pool.query(
      "SELECT topic_id, COUNT(*) FILTER (WHERE difficulty='easy') AS easy_count FROM questions GROUP BY topic_id"
    );
    const countMap = Object.fromEntries(counts.rows.map((r) => [r.topic_id, Number(r.easy_count)]));
    res.json(rows.map((t) => ({ ...t, questionCount: 10 })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/quiz/start
app.post('/api/quiz/start', async (req, res) => {
  const { topicId, difficulty = 'easy' } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM questions WHERE topic_id = $1 AND difficulty = $2 ORDER BY RANDOM() LIMIT 10',
      [topicId, difficulty]
    );
    if (rows.length === 0) return res.status(400).json({ error: 'No questions found' });

    const topicRes = await pool.query('SELECT name FROM topics WHERE id = $1', [topicId]);
    const topicName = topicRes.rows[0]?.name || 'Math';

    // Persist session to Postgres
    const sessionId = uuidv4();
    await pool.query(
      'INSERT INTO quiz_sessions (id, topic_id, difficulty, total_q) VALUES ($1, $2, $3, $4)',
      [sessionId, topicId, difficulty, rows.length]
    );

    // Store active quiz state in Redis
    await setSession(sessionId, {
      topicId: Number(topicId),
      topicName,
      difficulty,
      questions: rows,
      currentIndex: 0,
    });

    res.json({ sessionId, question: formatQuestion(rows[0], 1, rows.length) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start quiz' });
  }
});

// POST /api/quiz/:sessionId/answer
app.post('/api/quiz/:sessionId/answer', async (req, res) => {
  const { sessionId } = req.params;
  const { chosenOption } = req.body;

  try {
    const session = await getSession(sessionId);
    if (!session) return res.status(404).json({ error: 'Session expired or not found' });

    const q = session.questions[session.currentIndex];
    const isCorrect = chosenOption === q.correct_option;

    // Persist this answer to Postgres
    await pool.query(
      `INSERT INTO session_answers
        (session_id, question_id, question_text, option_a, option_b, option_c, option_d,
         chosen_option, correct_option, is_correct, explanation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        sessionId, q.id, q.question_text,
        q.option_a, q.option_b, q.option_c, q.option_d,
        chosenOption, q.correct_option, isCorrect, q.explanation,
      ]
    );

    session.currentIndex++;
    const hasNext = session.currentIndex < session.questions.length;

    if (hasNext) {
      await setSession(sessionId, session);
    } else {
      // Finalise session in Postgres
      const answersRes = await pool.query(
        'SELECT COUNT(*) FILTER (WHERE is_correct) AS correct FROM session_answers WHERE session_id = $1',
        [sessionId]
      );
      const correct = Number(answersRes.rows[0].correct);
      const scorePct = Math.round((correct / session.questions.length) * 100);
      await pool.query(
        'UPDATE quiz_sessions SET completed_at = NOW(), correct_q = $1, score_pct = $2 WHERE id = $3',
        [correct, scorePct, sessionId]
      );
      await deleteSession(sessionId);
    }

    const response = {
      isCorrect,
      correctOption: q.correct_option,
      explanation: q.explanation,
      hasNext,
    };
    if (hasNext) {
      response.nextQuestion = formatQuestion(
        session.questions[session.currentIndex],
        session.currentIndex + 1,
        session.questions.length
      );
    }
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// GET /api/quiz/:sessionId/summary
app.get('/api/quiz/:sessionId/summary', async (req, res) => {
  const { sessionId } = req.params;
  try {
    const sessionRes = await pool.query(
      `SELECT qs.*, t.name AS topic_name
       FROM quiz_sessions qs JOIN topics t ON t.id = qs.topic_id
       WHERE qs.id = $1`,
      [sessionId]
    );
    if (!sessionRes.rows.length) return res.status(404).json({ error: 'Session not found' });
    const s = sessionRes.rows[0];

    const answersRes = await pool.query(
      'SELECT * FROM session_answers WHERE session_id = $1 ORDER BY id',
      [sessionId]
    );

    const answers = answersRes.rows.map((a) => ({
      questionText: a.question_text,
      options: { a: a.option_a, b: a.option_b, c: a.option_c, d: a.option_d },
      chosen: a.chosen_option,
      correct: a.correct_option,
      isCorrect: a.is_correct,
      explanation: a.explanation,
      chosenText: a[`option_${a.chosen_option}`],
      correctText: a[`option_${a.correct_option}`],
    }));

    const wrongCount = answers.filter((a) => !a.isCorrect).length;

    res.json({
      topicId: s.topic_id,
      topicName: s.topic_name,
      difficulty: s.difficulty,
      score: s.correct_q,
      scorePercent: Number(s.score_pct),
      totalQuestions: s.total_q,
      correctCount: s.correct_q,
      wrongCount,
      answers,
      recommendations: buildRecommendations(wrongCount, s.topic_name, s.difficulty),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load summary' });
  }
});

// GET /api/history
app.get('/api/history', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        qs.id,
        qs.topic_id,
        t.name        AS topic_name,
        t.icon,
        qs.difficulty,
        qs.total_q,
        qs.correct_q,
        qs.score_pct,
        qs.started_at,
        qs.completed_at,
        EXTRACT(EPOCH FROM (qs.completed_at - qs.started_at))::INT AS duration_sec
      FROM quiz_sessions qs
      JOIN topics t ON t.id = qs.topic_id
      WHERE qs.completed_at IS NOT NULL
      ORDER BY qs.completed_at DESC
      LIMIT 50
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load history' });
  }
});

app.listen(PORT, () => console.log(`Quiz API running → http://localhost:${PORT}`));
