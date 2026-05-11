import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStudents, getStudentProgress } from '../../api/client';
import AdminLayout from './AdminLayout';

function ScoreBar({ pct }) {
  const c = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 99, height: 8, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: c, borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: '.82rem', fontWeight: 700, color: c, minWidth: 36 }}>{pct}%</span>
    </div>
  );
}

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [progress, setProgress] = useState(null);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    getAdminStudents().then(setStudents).catch(console.error).finally(() => setLoading(false));
  }, []);

  const openStudent = async (s) => {
    setSelected(s);
    setProgress(null);
    const data = await getStudentProgress(s.id);
    setProgress(data);
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const diffColor = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };

  return (
    <AdminLayout>
      <div className="admin-page">
        <h2 className="admin-page-title">Students ({students.length})</h2>

        <input
          className="admin-search"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {loading
          ? <div className="loading"><div className="spinner" /></div>
          : (
          <div className="admin-card" style={{ marginTop: 12 }}>
            {filtered.length === 0
              ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>No students found.</p>
              : (
              <table className="admin-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Quizzes</th><th>Avg Score</th><th>Last Active</th><th></th></tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
                      <td style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                      <td style={{ textAlign: 'center' }}>{s.total_quizzes}</td>
                      <td style={{ minWidth: 140 }}><ScoreBar pct={Number(s.avg_score)} /></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '.82rem' }}>{fmt(s.last_quiz || s.last_login)}</td>
                      <td>
                        <button className="admin-action-btn" onClick={() => openStudent(s)}>View →</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Student detail modal */}
        {selected && (
          <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0 }}>👤 {selected.name}</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: '.9rem' }}>{selected.email} · Joined {fmt(selected.created_at)}</p>

              {!progress
                ? <div className="loading"><div className="spinner" /></div>
                : (
                <>
                  {/* Topic progress bars */}
                  {progress.topicProgress.length > 0 && (
                    <>
                      <p style={{ fontWeight: 700, marginBottom: 12 }}>Progress by Topic</p>
                      {progress.topicProgress.map(t => (
                        <div key={t.topic} style={{ marginBottom: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '.85rem', fontWeight: 600 }}>
                            <span>{t.icon} {t.topic}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{t.avg_score}% · {t.attempts} quiz{t.attempts > 1 ? 'zes' : ''}</span>
                          </div>
                          <ScoreBar pct={Number(t.avg_score)} />
                        </div>
                      ))}
                    </>
                  )}

                  {/* Recent sessions */}
                  {progress.sessions.length > 0 && (
                    <>
                      <p style={{ fontWeight: 700, margin: '20px 0 10px' }}>Recent Quizzes</p>
                      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                        {progress.sessions.map(s => (
                          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '.85rem' }}>
                            <div>
                              <span style={{ fontWeight: 600 }}>{s.icon} {s.topic_name}</span>
                              <span className="diff-chip" style={{ marginLeft: 6, background: diffColor[s.difficulty] + '22', color: diffColor[s.difficulty] }}>{s.difficulty}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 700, color: Number(s.score_pct) >= 70 ? '#10b981' : '#f59e0b' }}>{s.score_pct}%</div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '.78rem' }}>{fmt(s.completed_at)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {progress.sessions.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No quizzes taken yet.</p>}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
