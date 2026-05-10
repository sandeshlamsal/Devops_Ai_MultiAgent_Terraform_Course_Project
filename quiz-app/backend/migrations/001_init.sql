-- Topics
CREATE TABLE IF NOT EXISTS topics (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  icon        VARCHAR(10),
  color       VARCHAR(20),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id             SERIAL PRIMARY KEY,
  topic_id       INT REFERENCES topics(id) ON DELETE CASCADE,
  difficulty     VARCHAR(10) NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  question_text  TEXT NOT NULL,
  option_a       TEXT NOT NULL,
  option_b       TEXT NOT NULL,
  option_c       TEXT NOT NULL,
  option_d       TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('a','b','c','d')),
  explanation    TEXT,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- Quiz sessions
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id      INT REFERENCES topics(id),
  difficulty    VARCHAR(10),
  started_at    TIMESTAMP DEFAULT NOW(),
  completed_at  TIMESTAMP,
  total_q       INT,
  correct_q     INT,
  score_pct     NUMERIC(5,2)
);

-- Per-question answers
CREATE TABLE IF NOT EXISTS session_answers (
  id              SERIAL PRIMARY KEY,
  session_id      UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id     INT REFERENCES questions(id),
  question_text   TEXT,
  option_a        TEXT,
  option_b        TEXT,
  option_c        TEXT,
  option_d        TEXT,
  chosen_option   CHAR(1),
  correct_option  CHAR(1),
  is_correct      BOOLEAN,
  explanation     TEXT,
  answered_at     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_topic_diff ON questions(topic_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_session_answers_session ON session_answers(session_id);
