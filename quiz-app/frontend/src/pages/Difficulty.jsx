import { useParams, useLocation, useNavigate } from 'react-router-dom';

const LEVELS = [
  {
    key: 'easy',
    label: 'Easy',
    emoji: '🟢',
    color: '#10b981',
    bg: '#d1fae5',
    border: '#6ee7b7',
    description: 'One-step problems — great for building confidence',
    examples: ['x + 3 = 8', 'Area = length × width', 'Name the shape'],
  },
  {
    key: 'medium',
    label: 'Medium',
    emoji: '🟡',
    color: '#f59e0b',
    bg: '#fef3c7',
    border: '#fcd34d',
    description: 'Two-step problems — apply what you know',
    examples: ['2x + 3 = 11', 'Area of a triangle', 'Missing angle'],
  },
  {
    key: 'hard',
    label: 'Hard',
    emoji: '🔴',
    color: '#ef4444',
    bg: '#fee2e2',
    border: '#fca5a5',
    description: 'Multi-step challenges — push your limits',
    examples: ['4(x−2) = 2x+6', 'Pythagorean theorem', 'Surface area of 3D shapes'],
  },
];

export default function Difficulty() {
  const { topicId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const topicName = state?.topicName || 'Math';

  return (
    <div className="page" style={{ padding: 0 }}>
      <div className="header">
        <span className="header-emoji">{topicName === 'Algebra' ? '𝑥' : '△'}</span>
        <h1>{topicName}</h1>
        <p>Choose your difficulty level</p>
      </div>

      <div className="container" style={{ padding: '0 20px' }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', margin: '24px 0 8px', fontSize: '0.9rem' }}
        >
          ← Back to topics
        </button>

        <div className="difficulty-grid">
          {LEVELS.map((level) => (
            <div
              key={level.key}
              className="difficulty-card"
              style={{ '--level-color': level.color, '--level-bg': level.bg, '--level-border': level.border }}
              onClick={() =>
                navigate(`/quiz/${topicId}/${level.key}`, {
                  state: { topicName, difficulty: level.key },
                })
              }
            >
              <div className="difficulty-badge">
                <span className="difficulty-emoji">{level.emoji}</span>
                <span className="difficulty-label" style={{ color: level.color }}>{level.label}</span>
              </div>

              <p className="difficulty-desc">{level.description}</p>

              <ul className="difficulty-examples">
                {level.examples.map((ex) => (
                  <li key={ex}>{ex}</li>
                ))}
              </ul>

              <div className="difficulty-footer">
                <span>10 questions</span>
                <span className="difficulty-start" style={{ color: level.color }}>Start →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
