const express = require('express');
const pool    = require('../db/postgres');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, requireAdmin);

// ── Dashboard stats ───────────────────────────────────────────────────────────
router.get('/stats', async (_req, res) => {
  try {
    const s = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role='student')                                          AS total_students,
        (SELECT COUNT(*) FROM quiz_sessions WHERE completed_at IS NOT NULL)                        AS total_quizzes,
        (SELECT COALESCE(ROUND(AVG(score_pct),1),0) FROM quiz_sessions WHERE completed_at IS NOT NULL) AS avg_score,
        (SELECT COUNT(*) FROM quiz_sessions WHERE completed_at > NOW()-INTERVAL '7 days')          AS quizzes_this_week
    `);
    const tp = await pool.query(`
      SELECT t.name, t.icon, ROUND(AVG(qs.score_pct),1) AS avg_score, COUNT(qs.id) AS attempts
      FROM quiz_sessions qs JOIN topics t ON t.id=qs.topic_id
      WHERE qs.completed_at IS NOT NULL
      GROUP BY t.name,t.icon ORDER BY avg_score DESC
    `);
    res.json({ ...s.rows[0], topicStats: tp.rows });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to load stats' }); }
});

// ── Students list ─────────────────────────────────────────────────────────────
router.get('/students', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.email, u.created_at, u.last_login,
             COUNT(qs.id)                                   AS total_quizzes,
             COALESCE(ROUND(AVG(qs.score_pct),1),0)         AS avg_score,
             MAX(qs.completed_at)                            AS last_quiz
      FROM users u
      LEFT JOIN quiz_sessions qs ON qs.user_id=u.id AND qs.completed_at IS NOT NULL
      WHERE u.role='student'
      GROUP BY u.id ORDER BY u.created_at DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Failed to load students' }); }
});

// ── Single student progress ───────────────────────────────────────────────────
router.get('/students/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const uRes = await pool.query('SELECT id,name,email,created_at FROM users WHERE id=$1 AND role=$2', [id,'student']);
    if (!uRes.rows.length) return res.status(404).json({ error: 'Student not found' });

    const sessions = await pool.query(`
      SELECT qs.id,qs.difficulty,qs.total_q,qs.correct_q,qs.score_pct,qs.started_at,qs.completed_at,
             t.name AS topic_name, t.icon
      FROM quiz_sessions qs JOIN topics t ON t.id=qs.topic_id
      WHERE qs.user_id=$1 AND qs.completed_at IS NOT NULL
      ORDER BY qs.completed_at DESC LIMIT 30
    `, [id]);

    const topicProgress = await pool.query(`
      SELECT t.name AS topic, t.icon, t.color,
             ROUND(AVG(qs.score_pct),1) AS avg_score,
             COUNT(*) AS attempts
      FROM quiz_sessions qs JOIN topics t ON t.id=qs.topic_id
      WHERE qs.user_id=$1 AND qs.completed_at IS NOT NULL
      GROUP BY t.name,t.icon,t.color ORDER BY avg_score DESC
    `, [id]);

    res.json({ student: uRes.rows[0], sessions: sessions.rows, topicProgress: topicProgress.rows });
  } catch (err) { res.status(500).json({ error: 'Failed to load progress' }); }
});

// ── Question management ───────────────────────────────────────────────────────
router.get('/questions', async (req, res) => {
  const { topic_id, difficulty } = req.query;
  let q = 'SELECT q.*,t.name AS topic_name FROM questions q JOIN topics t ON t.id=q.topic_id WHERE 1=1';
  const p = [];
  if (topic_id)   { p.push(topic_id);   q += ` AND q.topic_id=$${p.length}`; }
  if (difficulty) { p.push(difficulty); q += ` AND q.difficulty=$${p.length}`; }
  q += ' ORDER BY q.topic_id,q.difficulty,q.id';
  const { rows } = await pool.query(q, p);
  res.json(rows);
});

router.post('/questions', async (req, res) => {
  const { topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO questions (topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'Failed to add question' }); }
});

router.put('/questions/:id', async (req, res) => {
  const { topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation } = req.body;
  const { rows } = await pool.query(
    `UPDATE questions SET topic_id=$1,difficulty=$2,question_text=$3,option_a=$4,option_b=$5,
     option_c=$6,option_d=$7,correct_option=$8,explanation=$9 WHERE id=$10 RETURNING *`,
    [topic_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation,req.params.id]
  );
  rows.length ? res.json(rows[0]) : res.status(404).json({ error: 'Not found' });
});

router.delete('/questions/:id', async (req, res) => {
  await pool.query('DELETE FROM questions WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
