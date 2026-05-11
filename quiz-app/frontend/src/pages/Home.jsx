import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTopics } from '../api/client';
import { useAuth } from '../context/AuthContext';

const TOPIC_STYLES = {
  1: { bg: '#6366f1', iconBg: '#e0e7ff', iconColor: '#4f46e5' },
  2: { bg: '#f59e0b', iconBg: '#fef3c7', iconColor: '#d97706' },
  3: { bg: '#10b981', iconBg: '#d1fae5', iconColor: '#059669' },
  4: { bg: '#ef4444', iconBg: '#fee2e2', iconColor: '#dc2626' },
  5: { bg: '#8b5cf6', iconBg: '#ede9fe', iconColor: '#7c3aed' },
};

export default function Home() {
  const [topics, setTopics] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    getTopics().then(setTopics).catch(console.error);
  }, []);

  return (
    <div className="page" style={{ padding: 0 }}>
      <div className="header" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 20, right: 24, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link to="/formulas" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: 99 }}>📐 Formulas</Link>
          <Link to="/history"  style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: 99 }}>📊 History</Link>
          {user
            ? <Link to={user.role === 'admin' ? '/admin' : '/student'} style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', background: 'rgba(255,255,255,0.25)', padding: '6px 12px', borderRadius: 99 }}>👤 {user.name}</Link>
            : <Link to="/login" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', background: 'rgba(255,255,255,0.25)', padding: '6px 12px', borderRadius: 99 }}>🔑 Sign In</Link>
          }
        </div>
        <span className="header-emoji">🔢</span>
        <h1>Math Quiz</h1>
        <p>Texas Grade 6 — TEKS Aligned Practice</p>
      </div>

      <div className="container" style={{ padding: '0 20px' }}>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 28, marginBottom: 4, fontWeight: 600 }}>
          Choose a topic to start practising
        </p>

        <div className="topics-grid">
          {topics.map((topic) => {
            const style = TOPIC_STYLES[topic.id] || TOPIC_STYLES[1];
            return (
              <div key={topic.id} className="topic-card">
                <div className="topic-icon" style={{ background: style.iconBg, color: style.iconColor }}>
                  {topic.icon}
                </div>
                <h2>{topic.name}</h2>
                <p>{topic.description}</p>
                <span className="topic-badge">{topic.questionCount} questions</span>
                <button
                  className="topic-btn"
                  style={{ background: style.bg }}
                  onClick={() => navigate(`/difficulty/${topic.id}`, { state: { topicName: topic.name } })}
                >
                  Choose Level →
                </button>
              </div>
            );
          })}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 24, paddingBottom: 32 }}>
          Questions are shuffled every round. Good luck! 🎯
        </p>
      </div>
    </div>
  );
}
