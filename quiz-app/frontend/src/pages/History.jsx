import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory } from '../api/client';

const DIFF_META = {
  easy:   { emoji: '🟢', color: '#10b981', bg: '#d1fae5' },
  medium: { emoji: '🟡', color: '#f59e0b', bg: '#fef3c7' },
  hard:   { emoji: '🔴', color: '#ef4444', bg: '#fee2e2' },
};

function scoreColor(pct) {
  if (pct >= 80) return '#10b981';
  if (pct >= 50) return '#f59e0b';
  return '#ef4444';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatDuration(sec) {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function History() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then(setRecords)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Aggregate stats
  const total = records.length;
  const avg = total ? Math.round(records.reduce((s, r) => s + Number(r.score_pct), 0) / total) : 0;
  const best = total ? Math.max(...records.map((r) => Number(r.score_pct))) : 0;

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <span>Loading history…</span>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: 0 }}>
      {/* Header */}
      <div className="header">
        <span className="header-emoji">📊</span>
        <h1>Score History</h1>
        <p>Your past quiz attempts</p>
      </div>

      <div className="container" style={{ padding: '0 20px' }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', margin: '24px 0 16px', fontSize: '0.9rem' }}
        >
          ← Back to topics
        </button>

        {/* Summary stats */}
        {total > 0 && (
          <div className="history-stats">
            <div className="history-stat">
              <span className="history-stat-value">{total}</span>
              <span className="history-stat-label">Quizzes taken</span>
            </div>
            <div className="history-stat">
              <span className="history-stat-value" style={{ color: scoreColor(avg) }}>{avg}%</span>
              <span className="history-stat-label">Average score</span>
            </div>
            <div className="history-stat">
              <span className="history-stat-value" style={{ color: scoreColor(best) }}>{best}%</span>
              <span className="history-stat-label">Best score</span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {total === 0 && (
          <div className="history-empty">
            <span style={{ fontSize: '3rem' }}>📝</span>
            <h3>No quizzes yet</h3>
            <p>Complete a quiz and your results will appear here.</p>
            <button className="btn btn-primary" style={{ marginTop: 16, maxWidth: 200 }} onClick={() => navigate('/')}>
              Take a Quiz
            </button>
          </div>
        )}

        {/* Records list */}
        <div style={{ marginTop: 16, paddingBottom: 40 }}>
          {records.map((r) => {
            const diff = DIFF_META[r.difficulty] || DIFF_META.easy;
            const pct = Number(r.score_pct);
            return (
              <div key={r.id} className="history-card">
                {/* Left: topic + difficulty */}
                <div className="history-card-left">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: '1.3rem' }}>{r.icon}</span>
                    <span className="history-topic">{r.topic_name}</span>
                    <span
                      className="diff-chip"
                      style={{ background: diff.bg, color: diff.color }}
                    >
                      {diff.emoji} {r.difficulty}
                    </span>
                  </div>

                  {/* Score bar */}
                  <div className="history-bar-track">
                    <div
                      className="history-bar-fill"
                      style={{ width: `${pct}%`, background: scoreColor(pct) }}
                    />
                  </div>

                  <div className="history-meta">
                    <span>{formatDate(r.completed_at)}</span>
                    <span>⏱ {formatDuration(r.duration_sec)}</span>
                  </div>
                </div>

                {/* Right: score */}
                <div className="history-card-right">
                  <span className="history-score" style={{ color: scoreColor(pct) }}>{pct}%</span>
                  <span className="history-fraction">{r.correct_q}/{r.total_q}</span>
                  <button
                    className="history-retry-btn"
                    onClick={() =>
                      navigate(`/quiz/${r.topic_id}/${r.difficulty}`, {
                        state: { topicName: r.topic_name, difficulty: r.difficulty },
                      })
                    }
                  >
                    Retry →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
