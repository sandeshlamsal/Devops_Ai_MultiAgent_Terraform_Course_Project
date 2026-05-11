import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth, RequireAdmin, RedirectIfAuth } from './components/ProtectedRoute';
import Home            from './pages/Home';
import Difficulty      from './pages/Difficulty';
import Quiz            from './pages/Quiz';
import Summary         from './pages/Summary';
import History         from './pages/History';
import FormulaSheet    from './pages/FormulaSheet';
import Login           from './pages/Login';
import Register        from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard  from './pages/admin/AdminDashboard';
import AdminStudents   from './pages/admin/AdminStudents';
import AdminQuestions  from './pages/admin/AdminQuestions';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/"                   element={<Home />} />
        <Route path="/formulas"           element={<FormulaSheet />} />
        <Route path="/formulas/:topicId"  element={<FormulaSheet />} />
        <Route path="/difficulty/:topicId" element={<Difficulty />} />
        <Route path="/quiz/:topicId/:difficulty" element={<Quiz />} />
        <Route path="/summary/:sessionId" element={<Summary />} />
        <Route path="/history"            element={<History />} />

        {/* Auth (redirect if already logged in) */}
        <Route path="/login"    element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
        <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />

        {/* Student (must be logged in) */}
        <Route path="/student" element={<RequireAuth><StudentDashboard /></RequireAuth>} />

        {/* Admin (must be admin role) */}
        <Route path="/admin"           element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/admin/students"  element={<RequireAdmin><AdminStudents /></RequireAdmin>} />
        <Route path="/admin/questions" element={<RequireAdmin><AdminQuestions /></RequireAdmin>} />
      </Routes>
    </AuthProvider>
  );
}
