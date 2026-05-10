const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/mathquiz',
});

pool.on('error', (err) => console.error('Postgres error:', err.message));

module.exports = pool;
