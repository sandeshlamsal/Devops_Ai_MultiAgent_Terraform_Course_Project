require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs       = require('fs');
const path     = require('path');
const pool     = require('./db/postgres');
const { setSession, getSession, deleteSession } = require('./db/redis');
const { optionalAuth, JWT_SECRET } = require('./middleware/auth');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// ── Startup: run migrations then seed admin ───────────────────────────────────
async function runMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    try { await pool.query(sql); console.log(`Migration OK: ${file}`); }
    catch (err) { console.warn(`Migration warning (${file}):`, err.message); }
  }
}

async function seedAdmin() {
  const { rows } = await pool.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
  if (!rows.length) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
    await pool.query("INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,'admin')", [
      'Admin',
      process.env.ADMIN_EMAIL || 'admin@mathquiz.com',
      hash,
    ]);
    console.log('Default admin created → admin@mathquiz.com / Admin@123');
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatQuestion(q, number, total) {
  return { id: q.id, number, total, text: q.question_text,
           options: { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d } };
}

function buildRecommendations(wrongCount, topicName, difficulty) {
  if (!wrongCount)     return [{ topic: '🏆 Perfect Score!', reason: `All ${topicName} ${difficulty} questions correct. Try a harder level!` }];
  if (wrongCount <= 3) return [{ topic: `📖 Review ${topicName}`, reason: `${wrongCount} wrong. Re-read explanations then retry.` }];
  return [
    { topic: `📖 More ${topicName} Practice`, reason: `${wrongCount} wrong. Work through each explanation carefully.` },
    { topic: '💡 Tip', reason: 'Write your working step-by-step before answering.' },
  ];
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/admin',   require('./routes/admin'));
app.use('/api/student', require('./routes/student'));

app.get('/api/topics', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT id,name,description,icon,color FROM topics ORDER BY id');
    res.json(rows.map(t => ({ ...t, questionCount: 10 })));
  } catch (err) { res.status(500).json({ error: 'Database error' }); }
});

app.post('/api/quiz/start', optionalAuth, async (req, res) => {
  const { topicId, difficulty = 'easy' } = req.body;
  const userId = req.user?.userId || null;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM questions WHERE topic_id=$1 AND difficulty=$2 ORDER BY RANDOM() LIMIT 10',
      [topicId, difficulty]
    );
    if (!rows.length) return res.status(400).json({ error: 'No questions found' });

    const topicRes  = await pool.query('SELECT name FROM topics WHERE id=$1', [topicId]);
    const topicName = topicRes.rows[0]?.name || 'Math';
    const sessionId = uuidv4();

    await pool.query(
      'INSERT INTO quiz_sessions (id,topic_id,difficulty,total_q,user_id) VALUES ($1,$2,$3,$4,$5)',
      [sessionId, topicId, difficulty, rows.length, userId]
    );
    await setSession(sessionId, { topicId: Number(topicId), topicName, difficulty, questions: rows, currentIndex: 0 });
    res.json({ sessionId, question: formatQuestion(rows[0], 1, rows.length) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to start quiz' }); }
});

app.post('/api/quiz/:sessionId/answer', async (req, res) => {
  const { sessionId } = req.params;
  const { chosenOption } = req.body;
  try {
    const session = await getSession(sessionId);
    if (!session) return res.status(404).json({ error: 'Session expired or not found' });

    const q = session.questions[session.currentIndex];
    const isCorrect = chosenOption === q.correct_option;

    await pool.query(
      `INSERT INTO session_answers (session_id,question_id,question_text,option_a,option_b,option_c,option_d,
       chosen_option,correct_option,is_correct,explanation) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [sessionId,q.id,q.question_text,q.option_a,q.option_b,q.option_c,q.option_d,chosenOption,q.correct_option,isCorrect,q.explanation]
    );

    session.currentIndex++;
    const hasNext = session.currentIndex < session.questions.length;

    if (hasNext) {
      await setSession(sessionId, session);
    } else {
      const ans = await pool.query(
        "SELECT COUNT(*) FILTER (WHERE is_correct) AS correct FROM session_answers WHERE session_id=$1", [sessionId]
      );
      const correct  = Number(ans.rows[0].correct);
      const scorePct = Math.round((correct / session.questions.length) * 100);
      await pool.query(
        'UPDATE quiz_sessions SET completed_at=NOW(),correct_q=$1,score_pct=$2 WHERE id=$3',
        [correct, scorePct, sessionId]
      );
      await deleteSession(sessionId);
    }

    const response = { isCorrect, correctOption: q.correct_option, explanation: q.explanation, hasNext };
    if (hasNext) response.nextQuestion = formatQuestion(session.questions[session.currentIndex], session.currentIndex + 1, session.questions.length);
    res.json(response);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to submit answer' }); }
});

app.get('/api/quiz/:sessionId/summary', async (req, res) => {
  try {
    const sRes = await pool.query(
      'SELECT qs.*,t.name AS topic_name FROM quiz_sessions qs JOIN topics t ON t.id=qs.topic_id WHERE qs.id=$1',
      [req.params.sessionId]
    );
    if (!sRes.rows.length) return res.status(404).json({ error: 'Session not found' });
    const s = sRes.rows[0];

    const aRes = await pool.query('SELECT * FROM session_answers WHERE session_id=$1 ORDER BY id', [req.params.sessionId]);
    const answers = aRes.rows.map(a => ({
      questionText: a.question_text,
      options: { a: a.option_a, b: a.option_b, c: a.option_c, d: a.option_d },
      chosen: a.chosen_option, correct: a.correct_option,
      isCorrect: a.is_correct, explanation: a.explanation,
      chosenText: a[`option_${a.chosen_option}`], correctText: a[`option_${a.correct_option}`],
    }));

    const wrongCount = answers.filter(a => !a.isCorrect).length;
    res.json({
      topicId: s.topic_id, topicName: s.topic_name, difficulty: s.difficulty,
      score: s.correct_q, scorePercent: Number(s.score_pct),
      totalQuestions: s.total_q, correctCount: s.correct_q, wrongCount,
      answers, recommendations: buildRecommendations(wrongCount, s.topic_name, s.difficulty),
    });
  } catch (err) { res.status(500).json({ error: 'Failed to load summary' }); }
});

app.get('/api/history', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT qs.*,t.name AS topic_name,t.icon,
             EXTRACT(EPOCH FROM (qs.completed_at-qs.started_at))::INT AS duration_sec
      FROM quiz_sessions qs JOIN topics t ON t.id=qs.topic_id
      WHERE qs.completed_at IS NOT NULL ORDER BY qs.completed_at DESC LIMIT 50
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Failed to load history' }); }
});

// ── Boot ──────────────────────────────────────────────────────────────────────
async function boot() {
  await runMigrations();
  await seedAdmin();
  app.listen(PORT, () => console.log(`Quiz API → http://localhost:${PORT}`));
}

boot().catch(err => { console.error('Boot failed:', err); process.exit(1); });
