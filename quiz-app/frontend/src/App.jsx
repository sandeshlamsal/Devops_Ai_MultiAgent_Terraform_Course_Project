import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Difficulty from './pages/Difficulty';
import Quiz from './pages/Quiz';
import Summary from './pages/Summary';
import History from './pages/History';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/difficulty/:topicId" element={<Difficulty />} />
      <Route path="/quiz/:topicId/:difficulty" element={<Quiz />} />
      <Route path="/summary/:sessionId" element={<Summary />} />
      <Route path="/history" element={<History />} />
    </Routes>
  );
}
