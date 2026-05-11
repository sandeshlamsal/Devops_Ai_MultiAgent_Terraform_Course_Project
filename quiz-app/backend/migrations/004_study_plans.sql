CREATE TABLE IF NOT EXISTS student_study_plans (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES quiz_sessions(id) ON DELETE SET NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_plans_user ON student_study_plans(user_id);
