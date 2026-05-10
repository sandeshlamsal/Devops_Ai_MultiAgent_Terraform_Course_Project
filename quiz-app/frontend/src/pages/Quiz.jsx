import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { startQuiz, submitAnswer } from '../api/client';

const LABELS = ['a', 'b', 'c', 'd'];

export default function Quiz() {
  const { topicId, difficulty } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const topicName = state?.topicName || 'Math';

  const DIFF_COLORS = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };
  const diffColor = DIFF_COLORS[difficulty] || 'var(--primary)';

  useEffect(() => {
    startQuiz(Number(topicId), difficulty)
      .then(({ sessionId, question }) => {
        setSessionId(sessionId);
        setQuestion(question);
        setLoading(false);
      })
      .catch(console.error);
  }, [topicId]);

  async function handleSelect(option) {
    if (selected) return;
    setSelected(option);
    const res = await submitAnswer(sessionId, option);
    setResult(res);
  }

  function handleNext() {
    if (result.hasNext) {
      setQuestion(result.nextQuestion);
      setSelected(null);
      setResult(null);
    } else {
      navigate(`/summary/${sessionId}`);
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <span>Loading quiz…</span>
      </div>
    );
  }

  const progress = question ? Math.round(((question.number - 1) / question.total) * 100) : 0;

  function optionClass(key) {
    if (!selected) return 'option-btn';
    if (key === result?.correctOption) return 'option-btn highlight';
    if (key === selected && !result?.isCorrect) return 'option-btn wrong';
    return 'option-btn';
  }

  return (
    <div className="page">
      <div className="container">
        {/* Back link */}
        <button
          onClick={() => navigate(`/difficulty/${topicId}`, { state: { topicName } })}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: 16, fontSize: '0.9rem' }}
        >
          ← Change difficulty
        </button>

        <div className="card">
          {/* Progress */}
          <div className="quiz-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="quiz-topic-label">{topicName}</span>
              <span className="diff-chip" style={{ background: diffColor + '22', color: diffColor }}>
                {difficulty}
              </span>
            </div>
            <span className="quiz-counter">Question {question?.number} of {question?.total}</span>
          </div>

          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* Question */}
          <p className="question-text">{question?.text}</p>

          {/* Options */}
          <div className="options-grid">
            {LABELS.map((key) => (
              <button
                key={key}
                className={optionClass(key)}
                disabled={!!selected}
                onClick={() => handleSelect(key)}
              >
                <span className="option-letter">{key}</span>
                {question?.options[key]}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {result && (
            <>
              <div className={`feedback ${result.isCorrect ? 'correct' : 'wrong'}`}>
                <div className="feedback-title">
                  {result.isCorrect ? '✓ Correct!' : '✗ Not quite!'}
                </div>
                {result.explanation}
              </div>

              <button className="next-btn" onClick={handleNext}>
                {result.hasNext ? 'Next Question →' : 'See Results →'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
