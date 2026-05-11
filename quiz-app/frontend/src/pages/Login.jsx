import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { token, user } = await apiLogin(form);
      login(user, token);
      navigate(user.role === 'admin' ? '/admin' : '/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🔢</div>
        <h1 className="auth-title">Math Quiz</h1>
        <p className="auth-subtitle">Sign in to track your progress</p>

        <form onSubmit={submit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" required autoFocus />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          No account? <Link to="/register">Register as student</Link>
        </p>
        <p className="auth-footer" style={{ marginTop: 6 }}>
          <Link to="/" style={{ color: 'var(--text-muted)' }}>← Back to quiz</Link>
        </p>
      </div>
    </div>
  );
}
