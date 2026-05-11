const express = require('express');
const pool    = require('../db/postgres');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/history', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT qs.*,t.name AS topic_name,t.icon,t.color
      FROM quiz_sessions qs JOIN topics t ON t.id=qs.topic_id
      WHERE qs.user_id=$1 AND qs.completed_at IS NOT NULL
      ORDER BY qs.completed_at DESC LIMIT 50
    `, [req.user.userId]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Failed to load history' }); }
});

router.get('/stats', async (req, res) => {
  try {
    const s = await pool.query(`
      SELECT COUNT(*)                                    AS total_quizzes,
             COALESCE(ROUND(AVG(score_pct),1),0)         AS avg_score,
             COALESCE(MAX(score_pct),0)                  AS best_score
      FROM quiz_sessions WHERE user_id=$1 AND completed_at IS NOT NULL
    `, [req.user.userId]);

    const tp = await pool.query(`
      SELECT t.name AS topic,t.icon,t.color,
             ROUND(AVG(qs.score_pct),1) AS avg_score,
             COUNT(*) AS attempts
      FROM quiz_sessions qs JOIN topics t ON t.id=qs.topic_id
      WHERE qs.user_id=$1 AND qs.completed_at IS NOT NULL
      GROUP BY t.name,t.icon,t.color ORDER BY avg_score DESC
    `, [req.user.userId]);

    res.json({ ...s.rows[0], topicStats: tp.rows });
  } catch (err) { res.status(500).json({ error: 'Failed to load stats' }); }
});

module.exports = router;
