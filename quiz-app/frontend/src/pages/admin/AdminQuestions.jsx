import { useEffect, useState } from 'react';
import { getAdminQuestions, getTopics, addQuestion, updateQuestion, deleteQuestion } from '../../api/client';
import AdminLayout from './AdminLayout';

const BLANK = { topic_id: '', difficulty: 'easy', question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', explanation: '' };

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [topics,    setTopics]    = useState([]);
  const [filter,    setFilter]    = useState({ topic_id: '', difficulty: '' });
  const [form,      setForm]      = useState(null);  // null = closed, BLANK = add, {...} = edit
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const load = async () => {
    setLoading(true);
    const params = {};
    if (filter.topic_id)   params.topic_id   = filter.topic_id;
    if (filter.difficulty) params.difficulty  = filter.difficulty;
    const [qs, ts] = await Promise.all([getAdminQuestions(params), getTopics()]);
    setQuestions(qs);
    setTopics(ts);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const handleFilter = (e) => setFilter(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleForm   = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      form.id ? await updateQuestion(form.id, form) : await addQuestion(form);
      setForm(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save question');
    } finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this question?')) return;
    await deleteQuestion(id);
    load();
  };

  const diffColor = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 className="admin-page-title" style={{ margin: 0 }}>Questions ({questions.length})</h2>
          <button className="btn btn-primary" style={{ padding: '10px 18px' }} onClick={() => setForm({ ...BLANK })}>+ Add Question</button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <select name="topic_id" value={filter.topic_id} onChange={handleFilter} className="admin-select">
            <option value="">All Topics</option>
            {topics.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
          </select>
          <select name="difficulty" value={filter.difficulty} onChange={handleFilter} className="admin-select">
            <option value="">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Questions list */}
        {loading
          ? <div className="loading"><div className="spinner" /></div>
          : (
          <div className="admin-card">
            {questions.length === 0
              ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No questions match the filter.</p>
              : questions.map(q => (
                <div key={q.id} className="admin-q-row">
                  <div className="admin-q-meta">
                    <span className="diff-chip" style={{ background: diffColor[q.difficulty] + '22', color: diffColor[q.difficulty] }}>{q.difficulty}</span>
                    <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginLeft: 6 }}>{q.topic_name}</span>
                  </div>
                  <p className="admin-q-text">{q.question_text}</p>
                  <div className="admin-q-opts">
                    {['a','b','c','d'].map(k => (
                      <span key={k} className={`admin-q-opt ${q.correct_option === k ? 'correct' : ''}`}>
                        {k.toUpperCase()}. {q[`option_${k}`]}
                      </span>
                    ))}
                  </div>
                  <div className="admin-q-actions">
                    <button className="admin-action-btn" onClick={() => setForm({ ...q })}>Edit</button>
                    <button className="admin-action-btn danger" onClick={() => remove(q.id)}>Delete</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* Add/Edit modal */}
        {form && (
          <div className="admin-modal-overlay" onClick={() => setForm(null)}>
            <div className="admin-modal admin-modal-wide" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0 }}>{form.id ? 'Edit Question' : 'Add Question'}</h3>
                <button onClick={() => setForm(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
              </div>

              <form onSubmit={submit} className="admin-form">
                {error && <div className="auth-error">{error}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="auth-field">
                    <label>Topic</label>
                    <select name="topic_id" value={form.topic_id} onChange={handleForm} required className="admin-select" style={{ width: '100%' }}>
                      <option value="">Select topic…</option>
                      {topics.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                    </select>
                  </div>
                  <div className="auth-field">
                    <label>Difficulty</label>
                    <select name="difficulty" value={form.difficulty} onChange={handleForm} className="admin-select" style={{ width: '100%' }}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="auth-field">
                  <label>Question Text</label>
                  <textarea name="question_text" value={form.question_text} onChange={handleForm} required rows={2} style={{ resize: 'vertical' }} />
                </div>

                {['a','b','c','d'].map(k => (
                  <div key={k} className="auth-field">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      Option {k.toUpperCase()}
                      <input type="radio" name="correct_option" value={k} checked={form.correct_option === k} onChange={handleForm} />
                      <span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>correct</span>
                    </label>
                    <input name={`option_${k}`} value={form[`option_${k}`]} onChange={handleForm} required />
                  </div>
                ))}

                <div className="auth-field">
                  <label>Explanation (shown after wrong answer)</label>
                  <textarea name="explanation" value={form.explanation} onChange={handleForm} rows={2} style={{ resize: 'vertical' }} />
                </div>

                <button type="submit" className="auth-btn" disabled={saving}>
                  {saving ? 'Saving…' : (form.id ? 'Save Changes' : 'Add Question')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
