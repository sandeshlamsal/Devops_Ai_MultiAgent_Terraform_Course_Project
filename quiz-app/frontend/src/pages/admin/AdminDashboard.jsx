import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats } from '../../api/client';
import AdminLayout from './AdminLayout';

function StatCard({ label, value, color, icon }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon" style={{ background: color + '22', color }}>{icon}</div>
      <div>
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAdminStats().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><div className="loading"><div className="spinner" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-page">
        <h2 className="admin-page-title">Dashboard</h2>

        <div className="admin-stats-grid">
          <StatCard label="Total Students"    value={data.total_students}    icon="👥" color="#6366f1" />
          <StatCard label="Total Quizzes"     value={data.total_quizzes}     icon="📝" color="#10b981" />
          <StatCard label="Average Score"     value={`${data.avg_score}%`}   icon="⭐" color="#f59e0b" />
          <StatCard label="Quizzes This Week" value={data.quizzes_this_week} icon="📅" color="#8b5cf6" />
        </div>

        <div className="admin-card" style={{ marginTop: 28 }}>
          <h3 className="admin-card-title">Topic Performance</h3>
          {data.topicStats?.length === 0
            ? <p style={{ color: 'var(--text-muted)' }}>No quiz data yet.</p>
            : data.topicStats?.map(t => (
              <div key={t.name} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '.9rem', fontWeight: 600 }}>
                  <span>{t.icon} {t.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{t.avg_score}% avg · {t.attempts} attempts</span>
                </div>
                <div style={{ background: '#f1f5f9', borderRadius: 99, height: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${t.avg_score}%`, height: '100%', background: Number(t.avg_score) >= 70 ? '#10b981' : '#f59e0b', borderRadius: 99, transition: 'width .5s' }} />
                </div>
              </div>
            ))
          }
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/admin/students')}>👥 View Students</button>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('/admin/questions')}>❓ Manage Questions</button>
        </div>
      </div>
    </AdminLayout>
  );
}
