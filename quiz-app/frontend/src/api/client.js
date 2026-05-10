import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const getTopics = () => api.get('/topics').then((r) => r.data);

export const startQuiz = (topicId, difficulty = 'easy') =>
  api.post('/quiz/start', { topicId, difficulty }).then((r) => r.data);

export const submitAnswer = (sessionId, chosenOption) =>
  api.post(`/quiz/${sessionId}/answer`, { chosenOption }).then((r) => r.data);

export const getSummary = (sessionId) =>
  api.get(`/quiz/${sessionId}/summary`).then((r) => r.data);

export const getHistory = () =>
  api.get('/history').then((r) => r.data);
