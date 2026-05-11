CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100)        NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255)        NOT NULL,
  role       VARCHAR(10)         NOT NULL DEFAULT 'student' CHECK (role IN ('student','admin')),
  created_at TIMESTAMP           DEFAULT NOW(),
  last_login TIMESTAMP
);

ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user ON quiz_sessions(user_id);
