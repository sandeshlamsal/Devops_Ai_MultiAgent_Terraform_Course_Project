import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin',           label: '📊 Dashboard',  end: true },
  { to: '/admin/students',  label: '👥 Students' },
  { to: '/admin/questions', label: '❓ Questions' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          🔢 Math Quiz<br />
          <span>Admin Panel</span>
        </div>

        <nav className="admin-nav">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout at bottom */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-row">
            <div className="admin-avatar">{user?.name?.[0]}</div>
            <div className="admin-user-info">
              <div className="admin-user-name">{user?.name}</div>
              <div className="admin-user-role">Administrator</div>
            </div>
          </div>
          <button
            className="admin-signout-btn"
            onClick={() => setConfirm(true)}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      <main className="admin-main">{children}</main>

      {/* Confirmation modal */}
      {confirm && (
        <div className="admin-modal-overlay" onClick={() => setConfirm(false)}>
          <div
            className="admin-modal"
            style={{ maxWidth: 360, textAlign: 'center' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🚪</div>
            <h3 style={{ margin: '0 0 8px' }}>Sign Out?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '.92rem' }}>
              You'll be returned to the login page.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => setConfirm(false)}
              >
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
    </div>
  );
}
