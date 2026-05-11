const { Kafka } = require('kafkajs');
const pool      = require('../db/postgres');
const redis     = require('../db/redis');
const TOPICS    = require('./topics');

const BOOTSTRAP = process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092';

const kafka = new Kafka({
  clientId: 'quiz-backend',
  brokers:  [BOOTSTRAP],
  retry: { retries: 5 },
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'backend-results-group' });

// ── Producer ──────────────────────────────────────────────────────────────────

async function connectProducer() {
  await producer.connect();
  console.log('Kafka producer connected');
}

async function publish(topic, value) {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(value) }],
  });
}

// ── Consumer ──────────────────────────────────────────────────────────────────

async function connectConsumer() {
  await consumer.connect();
  await consumer.subscribe({
    topics: [TOPICS.QUESTIONS_READY, TOPICS.STUDY_PLAN_READY],
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const payload = JSON.parse(message.value.toString());

      if (topic === TOPICS.QUESTIONS_READY) {
        await handleQuestionsReady(payload);
      } else if (topic === TOPICS.STUDY_PLAN_READY) {
        await handleStudyPlanReady(payload);
      }
    },
  });

  console.log('Kafka consumer running — listening for agent results');
}

// ── Handlers ─────────────────────────────────────────────────────────────────

async function handleQuestionsReady(payload) {
  const { requestId, topicId, difficulty, questions, error } = payload;

  if (error || !questions?.length) {
    await redis.redis.setex(
      `generation:${requestId}`,
      300,
      JSON.stringify({ status: 'error', error: error || 'No questions returned', count: 0 })
    );
    return;
  }

  // Insert generated questions into Postgres
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const q of questions) {
      await client.query(
        `INSERT INTO questions
          (topic_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [topicId, difficulty, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.explanation]
      );
    }
    await client.query('COMMIT');
    console.log(`[${requestId}] Saved ${questions.length} AI-generated questions`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`[${requestId}] Failed to save questions:`, err.message);
  } finally {
    client.release();
  }

  // Update generation status in Redis (frontend polls this)
  await redis.redis.setex(
    `generation:${requestId}`,
    300,
    JSON.stringify({ status: 'done', count: questions.length, error: null })
  );
}

async function handleStudyPlanReady(payload) {
  const { sessionId, userId, plan } = payload;
  try {
    await pool.query(
      'INSERT INTO student_study_plans (user_id, session_id, content) VALUES ($1,$2,$3)',
      [userId, sessionId, plan]
    );
    console.log(`Study plan saved for user ${userId}`);
  } catch (err) {
    console.error('Failed to save study plan:', err.message);
  }
}

module.exports = { connectProducer, connectConsumer, publish, TOPICS };
