const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => console.error('Redis error:', err.message));

const SESSION_TTL = 60 * 30; // 30 minutes

async function setSession(sessionId, data) {
  await redis.setex(`session:${sessionId}`, SESSION_TTL, JSON.stringify(data));
}

async function getSession(sessionId) {
  const raw = await redis.get(`session:${sessionId}`);
  return raw ? JSON.parse(raw) : null;
}

async function deleteSession(sessionId) {
  await redis.del(`session:${sessionId}`);
}

module.exports = { redis, setSession, getSession, deleteSession };
