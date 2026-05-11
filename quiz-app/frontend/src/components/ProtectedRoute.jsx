import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export function RequireAdmin({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export function RedirectIfAuth({ children }) {
  const { user } = useAuth();
  if (!user) return children;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
}
