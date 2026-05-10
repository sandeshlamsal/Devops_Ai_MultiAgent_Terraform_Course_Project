import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSummary } from '../api/client';

function scoreEmoji(pct) {
  if (pct === 100) return '🏆';
  if (pct >= 80) return '🎉';
  if (pct >= 60) return '👍';
  if (pct >= 40) return '📖';
  return '💪';
}

export default function Summary() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    getSummary(sessionId).then(setData).catch(console.error);
  }, [sessionId]);

  if (!data) {
    return (
      <div className="loading">
        <div className="spinner" />
        <span>Loading results…</span>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: '24px 16px 48px' }}>
      <div className="container">
        {/* Hero */}
        <div className="summary-hero">
          <div className="score-ring">
            <span className="score-pct">{data.scorePercent}%</span>
            <span className="score-label">score</span>
          </div>

          <h2>{scoreEmoji(data.scorePercent)} Quiz Complete!</h2>
          <p>{data.topicName} · {data.difficulty && data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1)} · {data.totalQuestions} questions</p>

          <div className="stats-row">
            <span className="stat-chip">✓ {data.correctCount} correct</span>
            <span className="stat-chip">✗ {data.wrongCount} wrong</span>
          </div>
        </div>

        {/* Body */}
        <div className="summary-body">

          {/* Recommendations */}
          <p className="section-title">📌 Recommendations</p>
          {data.recommendations.map((rec, i) => (
            <div key={i} className="rec-item">
              <h4>{rec.topic}</h4>
              <p>{rec.reason}</p>
            </div>
          ))}

          {/* Question review */}
          <p className="section-title">📋 Question Review</p>
          {data.answers.map((a, i) => (
            <div key={i} className={`answer-item ${a.isCorrect ? 'correct' : 'wrong'}`}>
              <span className="answer-icon">{a.isCorrect ? '✅' : '❌'}</span>
              <div className="answer-content">
                <p className="answer-q">Q{i + 1}. {a.questionText}</p>

                {a.isCorrect ? (
                  <p className="answer-detail">Your answer: <span>{a.chosenText}</span></p>
                ) : (
                  <>
                    <p className="answer-detail">
                      Your answer: <span style={{ color: 'var(--error)' }}>{a.chosenText}</span>
                      &nbsp;·&nbsp;
                      Correct: <span style={{ color: 'var(--success)' }}>{a.correctText}</span>
                    </p>
                    <p className="answer-explanation">💡 {a.explanation}</p>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Actions */}
          <div className="action-row">
            <button className="btn btn-outline" onClick={() => navigate('/')}>
              ← New Topic
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/history')}>
              📊 History
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/quiz/${data.topicId}/${data.difficulty}`, { state: { topicName: data.topicName, difficulty: data.difficulty } })}
            >
              Try Again 🔄
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
