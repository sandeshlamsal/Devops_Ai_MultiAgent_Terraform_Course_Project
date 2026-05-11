import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm]   = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      const { token, user } = await apiRegister({ name: form.name, email: form.email, password: form.password });
      login(user, token);
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🔢</div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join Math Quiz to track your progress</p>

        <form onSubmit={submit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={handle} placeholder="Your name" required autoFocus />
          </div>
          <div className="auth-field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" required />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="Min 6 characters" required />
          </div>
          <div className="auth-field">
            <label>Confirm Password</label>
            <input name="confirm" type="password" value={form.confirm} onChange={handle} placeholder="Repeat password" required />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
