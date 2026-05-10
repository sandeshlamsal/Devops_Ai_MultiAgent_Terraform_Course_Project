import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTopics } from '../api/client';

const TOPIC_COLORS = {
  1: { bg: '#6366f1', iconBg: '#e0e7ff', iconColor: '#4f46e5' },
  2: { bg: '#f59e0b', iconBg: '#fef3c7', iconColor: '#d97706' },
};

export default function Home() {
  const [topics, setTopics] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getTopics().then(setTopics).catch(console.error);
  }, []);

  return (
    <div className="page" style={{ padding: 0 }}>
      <div className="header" style={{ position: 'relative' }}>
        <Link
          to="/history"
          style={{
            position: 'absolute', top: 20, right: 24,
            color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem',
            fontWeight: 600, textDecoration: 'none', background: 'rgba(255,255,255,0.15)',
            padding: '6px 14px', borderRadius: '99px',
          }}
        >
          📊 History
        </Link>
        <span className="header-emoji">🔢</span>
        <h1>Math Quiz</h1>
        <p>Grade 6 Practice — Algebra &amp; Geometry</p>
      </div>

      <div className="container" style={{ padding: '0 20px' }}>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 32, marginBottom: 8, fontWeight: 600 }}>
          Choose a topic to start practising
        </p>

        <div className="topics-grid">
          {topics.map((topic) => {
            const colors = TOPIC_COLORS[topic.id] || TOPIC_COLORS[1];
            return (
              <div key={topic.id} className="topic-card">
                <div
                  className="topic-icon"
                  style={{ background: colors.iconBg, color: colors.iconColor }}
                >
                  {topic.icon}
                </div>

                <h2>{topic.name}</h2>
                <p>{topic.description}</p>
                <span className="topic-badge">{topic.questionCount} questions</span>

                <button
                  className="topic-btn"
                  style={{ background: colors.bg }}
                  onClick={() => navigate(`/difficulty/${topic.id}`, { state: { topicName: topic.name } })}
                >
                  Choose Level →
                </button>
              </div>
            );
          })}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 32 }}>
          Questions are shuffled every round. Good luck! 🎯
        </p>
      </div>
    </div>
  );
}
