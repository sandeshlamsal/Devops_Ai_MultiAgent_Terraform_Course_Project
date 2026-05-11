import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getStudentStats, getStudentHistory } from '../api/client';
import { useAuth } from '../context/AuthContext';

function ScoreBar({ pct, color }) {
  const c = Number(pct) >= 80 ? '#10b981' : Number(pct) >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ background: '#f1f5f9', borderRadius: 99, height: 10, overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color || c, borderRadius: 99, transition: 'width .5s' }} />
    </div>
  );
}

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats,   setStats]   = useState(null);
  const [history, setHistory] = useState([]);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    getStudentStats().then(setStats).catch(console.error);
    getStudentHistory().then(setHistory).catch(console.error);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const diffColor = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };

  return (
    <div className="page" style={{ padding: 0 }}>
      {/* Header */}
      <div className="header" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,.8)', fontSize: '.85rem', fontWeight: 600, textDecoration: 'none', background: 'rgba(255,255,255,.15)', padding: '6px 12px', borderRadius: 99 }}>
            🏠 Home
          </Link>
          <button
            onClick={() => setConfirmLogout(true)}
            style={{ color: 'rgba(255,255,255,.9)', fontSize: '.85rem', fontWeight: 700, background: 'rgba(239,68,68,.35)', border: '1.5px solid rgba(255,255,255,.3)', padding: '6px 14px', borderRadius: 99, cursor: 'pointer' }}
          >
            🚪 Sign Out
          </button>
        </div>
        <span className="header-emoji">👤</span>
        <h1>{user?.name}</h1>
        <p>{user?.email} · Student</p>
      </div>

      {/* Logout confirmation modal */}
      {confirmLogout && (
        <div className="admin-modal-overlay" onClick={() => setConfirmLogout(false)}>
          <div className="admin-modal" style={{ maxWidth: 360, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🚪</div>
            <h3 style={{ margin: '0 0 8px' }}>Sign Out?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '.92rem' }}>
              You'll need to sign in again to access your progress.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setConfirmLogout(false)}>
                Cancel
              </button>
              <button
                className="btn"
                style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none' }}
                onClick={handleLogout}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container" style={{ padding: '0 20px' }}>
        {/* Stats row */}
        {stats && (
          <div className="history-stats" style={{ marginTop: 24 }}>
            <div className="history-stat">
              <span className="history-stat-value">{stats.total_quizzes}</span>
              <span className="history-stat-label">Quizzes taken</span>
            </div>
            <div className="history-stat">
              <span className="history-stat-value" style={{ color: Number(stats.avg_score) >= 70 ? '#10b981' : '#f59e0b' }}>{stats.avg_score}%</span>
              <span className="history-stat-label">Average score</span>
            </div>
            <div className="history-stat">
              <span className="history-stat-value" style={{ color: '#10b981' }}>{stats.best_score}%</span>
              <span className="history-stat-label">Best score</span>
            </div>
          </div>
        )}

        {/* Topic progress */}
        {stats?.topicStats?.length > 0 && (
          <div className="card" style={{ marginTop: 20 }}>
            <p className="section-title" style={{ marginTop: 0 }}>📊 Progress by Topic</p>
            {stats.topicStats.map(t => (
              <div key={t.topic} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '.88rem', fontWeight: 600 }}>
                  <span>{t.icon} {t.topic}</span>
                  <span style={{ color: Number(t.avg_score) >= 70 ? '#10b981' : '#f59e0b' }}>{t.avg_score}% ({t.attempts} quiz{t.attempts > 1 ? 'zes' : ''})</span>
                </div>
                <ScoreBar pct={t.avg_score} color={t.color} />
              </div>
            ))}
          </div>
        )}

        {/* Take quiz CTA */}
        <button
          className="next-btn"
          style={{ marginTop: 20 }}
          onClick={() => navigate('/')}
        >
          Take a Quiz →
        </button>

        {/* Recent history */}
        <p className="section-title" style={{ marginTop: 28 }}>🕐 Recent Quizzes</p>
        {history.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>No quizzes yet — take one!</p>}
        {history.map(r => (
          <div key={r.id} className="history-card">
            <div className="history-card-left">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: '1.1rem' }}>{r.icon}</span>
                <span className="history-topic">{r.topic_name}</span>
                <span className="diff-chip" style={{ background: diffColor[r.difficulty] + '22', color: diffColor[r.difficulty] }}>{r.difficulty}</span>
              </div>
              <div className="history-bar-track">
                <div className="history-bar-fill" style={{ width: `${r.score_pct}%`, background: Number(r.score_pct) >= 70 ? '#10b981' : '#f59e0b' }} />
              </div>
              <div className="history-meta"><span>{fmt(r.completed_at)}</span></div>
            </div>
            <div className="history-card-right">
              <span className="history-score" style={{ color: Number(r.score_pct) >= 70 ? '#10b981' : '#f59e0b' }}>{r.score_pct}%</span>
              <span className="history-fraction">{r.correct_q}/{r.total_q}</span>
            </div>
          </div>
        ))}
        <div style={{ paddingBottom: 40 }} />
      </div>
    </div>
  );
}
