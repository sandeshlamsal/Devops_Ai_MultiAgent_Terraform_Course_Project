# Quiz App — Architecture & Data Flow

Full documentation of how the React frontend, Node/Express backend, PostgreSQL database,
and Redis cache work together across every user interaction.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BROWSER (React + Vite)                               │
│                         http://localhost:5173                               │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ HTTP (proxied by Vite → /api/*)
┌───────────────────────────────────▼─────────────────────────────────────────┐
│                    NODE.JS / EXPRESS BACKEND                                │
│                         http://localhost:3001                               │
│                                                                             │
│   GET  /api/topics                                                          │
│   POST /api/quiz/start                                                      │
│   POST /api/quiz/:sessionId/answer                                          │
│   GET  /api/quiz/:sessionId/summary                                         │
│   GET  /api/history                                                         │
└──────────────┬──────────────────────────────────┬───────────────────────────┘
               │ SQL (pg)                         │ Key-Value (ioredis)
┌──────────────▼──────────────┐   ┌───────────────▼───────────────────────────┐
│       POSTGRESQL            │   │                 REDIS                     │
│    db: mathquiz             │   │         redis://localhost:6379             │
│                             │   │                                           │
│  topics                     │   │  session:{uuid}   TTL: 30 min             │
│  questions (60 rows)        │   │  (active quiz state only)                 │
│  quiz_sessions              │   └───────────────────────────────────────────┘
│  session_answers            │
└─────────────────────────────┘
```

---

## Component Responsibilities

| Layer | Technology | Owns |
|-------|-----------|------|
| Frontend | React 18 + Vite | UI rendering, routing, user interaction |
| Backend | Node.js + Express | Business logic, API, session orchestration |
| PostgreSQL | pg (node-postgres) | All permanent data — questions, sessions, answers |
| Redis | ioredis | Live quiz state during an active session only |

---

## Pages & Routes

### Frontend Routes (React Router v6)

| URL | Page | What it does |
|-----|------|-------------|
| `/` | `Home.jsx` | Lists topics fetched from API |
| `/difficulty/:topicId` | `Difficulty.jsx` | Shows Easy / Medium / Hard selector |
| `/quiz/:topicId/:difficulty` | `Quiz.jsx` | Runs the quiz — one question at a time |
| `/summary/:sessionId` | `Summary.jsx` | Fetches and renders final results |
| `/history` | `History.jsx` | Lists all past completed sessions |

### Backend API Routes (Express)

| Method | Path | Reads from | Writes to |
|--------|------|-----------|----------|
| GET | `/api/topics` | PostgreSQL | — |
| POST | `/api/quiz/start` | PostgreSQL | PostgreSQL + Redis |
| POST | `/api/quiz/:id/answer` | Redis | PostgreSQL + Redis |
| GET | `/api/quiz/:id/summary` | PostgreSQL | — |
| GET | `/api/history` | PostgreSQL | — |

---

## Full User Flow — Step by Step

### 1. Home Page — Topic Selection

```
Browser loads http://localhost:5173
     │
     ▼
Home.jsx mounts
     │
     ├── useEffect → GET /api/topics
     │                     │
     │               SELECT id, name, description, icon, color
     │               FROM topics ORDER BY id
     │               (PostgreSQL → 2 rows)
     │                     │
     └── renders 2 topic cards: Algebra · Geometry
```

User clicks **"Choose Level →"** on a topic card.
React Router navigates to `/difficulty/:topicId` passing `topicName` via location state.

---

### 2. Difficulty Page — Level Selection

```
Difficulty.jsx renders (no API call — static UI)

3 cards displayed:
  🟢 Easy   — one-step problems
  🟡 Medium — two-step problems
  🔴 Hard   — multi-step challenges
```

User clicks a level card.
React Router navigates to `/quiz/:topicId/:difficulty`.

---

### 3. Quiz Start — Session Initialisation

```
Quiz.jsx mounts
     │
     ├── useEffect → POST /api/quiz/start
     │               Body: { topicId: 1, difficulty: "medium" }
     │
     │  ── Backend ──────────────────────────────────────────────
     │
     │  1. PostgreSQL query:
     │     SELECT * FROM questions
     │     WHERE topic_id = 1 AND difficulty = 'medium'
     │     ORDER BY RANDOM() LIMIT 10
     │     → 10 shuffled rows returned
     │
     │  2. PostgreSQL INSERT:
     │     INSERT INTO quiz_sessions (id, topic_id, difficulty, total_q)
     │     VALUES ('uuid-...', 1, 'medium', 10)
     │     → session row created (completed_at is NULL = in progress)
     │
     │  3. Redis SETEX:
     │     Key:   session:{uuid}
     │     Value: { topicId, topicName, difficulty, questions[10], currentIndex: 0 }
     │     TTL:   1800 seconds (30 minutes)
     │     → full question list stored in cache
     │
     │  Response: { sessionId, question: { id, number:1, total:10, text, options } }
     │
     └── Quiz.jsx stores sessionId, renders first question card
```

**Why Redis here?**
The full 10-question list is stored in Redis so that every subsequent answer request
doesn't re-query PostgreSQL. Redis serves as the fast, ephemeral working memory for
the active quiz — no DB round-trip needed per question.

---

### 4. Answering a Question

```
User clicks an answer option (e.g. "b")
     │
     ├── POST /api/quiz/:sessionId/answer
     │   Body: { chosenOption: "b" }
     │
     │  ── Backend ──────────────────────────────────────────────
     │
     │  1. Redis GET session:{sessionId}
     │     → { questions[10], currentIndex: 3 }
     │     Pull current question from the cached list (no DB read)
     │
     │  2. Grade the answer:
     │     isCorrect = (chosenOption === question.correct_option)
     │
     │  3. PostgreSQL INSERT:
     │     INSERT INTO session_answers
     │       (session_id, question_id, question_text, option_a..d,
     │        chosen_option, correct_option, is_correct, explanation)
     │     VALUES (...)
     │     → answer permanently recorded immediately
     │
     │  4a. If more questions remain:
     │      currentIndex++ → Redis SETEX (updated state, reset TTL)
     │
     │  4b. If last question answered:
     │      ┌─ PostgreSQL query:
     │      │  SELECT COUNT(*) FILTER (WHERE is_correct)
     │      │  FROM session_answers WHERE session_id = ?
     │      │
     │      ├─ PostgreSQL UPDATE:
     │      │  UPDATE quiz_sessions
     │      │  SET completed_at = NOW(), correct_q = 7, score_pct = 70.00
     │      │  WHERE id = ?
     │      │
     │      └─ Redis DEL session:{sessionId}
     │         → cache entry removed (session is complete, not needed)
     │
     │  Response: { isCorrect, correctOption, explanation, hasNext, nextQuestion? }
     │
     └── Quiz.jsx shows feedback banner (✓ green / ✗ red)
         Shows explanation text
         Renders "Next Question →" or "See Results →" button
```

**Answer persistence is immediate** — each answer hits PostgreSQL the moment it is
submitted, not at the end. If the browser crashes mid-quiz, all answered questions
are already saved.

---

### 5. Summary Page

```
User clicks "See Results →"
React Router navigates to /summary/:sessionId
     │
     ├── Summary.jsx mounts → GET /api/quiz/:sessionId/summary
     │
     │  ── Backend ──────────────────────────────────────────────
     │
     │  1. PostgreSQL JOIN query:
     │     SELECT qs.*, t.name AS topic_name
     │     FROM quiz_sessions qs
     │     JOIN topics t ON t.id = qs.topic_id
     │     WHERE qs.id = ?
     │     → session row with score_pct already computed
     │
     │  2. PostgreSQL query:
     │     SELECT * FROM session_answers
     │     WHERE session_id = ? ORDER BY id
     │     → all 10 answered questions in order
     │
     │  3. Build response:
     │     - Map chosen/correct option letters → answer text
     │     - Generate recommendations based on wrong answer count
     │
     │  Response: {
     │    topicId, topicName, difficulty,
     │    score, scorePercent, totalQuestions, correctCount, wrongCount,
     │    answers: [{ questionText, chosen, correct, isCorrect, explanation,
     │               chosenText, correctText }],
     │    recommendations: [{ topic, reason }]
     │  }
     │
     └── Summary.jsx renders:
           - Animated score ring (e.g. 70%)
           - ✓ correct / ✗ wrong chip stats
           - Recommendations panel
           - Per-question review (wrong answers show explanation)
           - Action buttons: New Topic · History · Try Again
```

**Note:** Redis key is already deleted at this point (deleted after last answer).
The summary reads exclusively from PostgreSQL.

---

### 6. History Page

```
User clicks "📊 History" (Home header or Summary page)
React Router navigates to /history
     │
     ├── History.jsx mounts → GET /api/history
     │
     │  ── Backend ──────────────────────────────────────────────
     │
     │  PostgreSQL query:
     │    SELECT qs.id, qs.topic_id, t.name, t.icon, qs.difficulty,
     │           qs.total_q, qs.correct_q, qs.score_pct,
     │           qs.started_at, qs.completed_at,
     │           EXTRACT(EPOCH FROM (completed_at - started_at)) AS duration_sec
     │    FROM quiz_sessions qs
     │    JOIN topics t ON t.id = qs.topic_id
     │    WHERE qs.completed_at IS NOT NULL
     │    ORDER BY qs.completed_at DESC
     │    LIMIT 50
     │
     │  Response: array of last 50 completed sessions
     │
     └── History.jsx renders:
           - Stats bar: total quizzes · average score · best score
           - One card per session:
               topic icon + name · difficulty chip
               score bar (width = score%) · date · duration
               score % and fraction · "Retry →" button
```

---

## Database Schema

```sql
topics
  id          SERIAL PK
  name        VARCHAR(100)      -- 'Algebra', 'Geometry'
  description TEXT
  icon        VARCHAR(10)       -- '𝑥', '△'
  color       VARCHAR(20)       -- '#6366f1', '#f59e0b'

questions
  id             SERIAL PK
  topic_id       → topics.id
  difficulty     VARCHAR(10)    -- 'easy' | 'medium' | 'hard'
  question_text  TEXT
  option_a/b/c/d TEXT
  correct_option CHAR(1)        -- 'a' | 'b' | 'c' | 'd'
  explanation    TEXT

quiz_sessions
  id            UUID PK
  topic_id      → topics.id
  difficulty    VARCHAR(10)
  started_at    TIMESTAMP       -- set on POST /quiz/start
  completed_at  TIMESTAMP       -- set on last answer submission (NULL = in progress)
  total_q       INT             -- always 10
  correct_q     INT             -- filled on completion
  score_pct     NUMERIC(5,2)   -- filled on completion

session_answers
  id              SERIAL PK
  session_id      → quiz_sessions.id
  question_id     → questions.id
  question_text   TEXT          -- denormalised snapshot (question never changes)
  option_a/b/c/d  TEXT          -- denormalised snapshot
  chosen_option   CHAR(1)
  correct_option  CHAR(1)
  is_correct      BOOLEAN
  explanation     TEXT
  answered_at     TIMESTAMP
```

---

## Redis Key Structure

| Key | Type | TTL | Contents |
|-----|------|-----|---------|
| `session:{uuid}` | String (JSON) | 30 min | `{ topicId, topicName, difficulty, questions[], currentIndex }` |

- **Created** on `POST /api/quiz/start`
- **Updated** on each `POST /api/quiz/:id/answer` (currentIndex advances)
- **Deleted** on the final answer submission (session complete)
- **Expires automatically** at 30 min TTL if the user abandons the quiz

---

## Data Flow Summary

```
Action               PostgreSQL writes          Redis writes        Redis reads
─────────────────────────────────────────────────────────────────────────────
Start quiz           INSERT quiz_sessions       SETEX session       —
Answer question      INSERT session_answers     SETEX (index++)     GET session
Last answer          UPDATE quiz_sessions       DEL session         GET session
View summary         —                          —                   —
View history         —                          —                   —
```

---

## Project File Map

```
quiz-app/
├── backend/
│   ├── src/
│   │   ├── index.js              Express app + all route handlers
│   │   ├── db/
│   │   │   ├── postgres.js       pg.Pool — PostgreSQL connection
│   │   │   └── redis.js          ioredis — helpers: setSession / getSession / deleteSession
│   │   └── data/
│   │       └── questions.js      (legacy in-memory data — superseded by DB seed)
│   ├── migrations/
│   │   ├── 001_init.sql          CREATE TABLE statements + indexes
│   │   └── 002_seed.sql          INSERT for 2 topics + 60 questions
│   ├── .env                      DATABASE_URL · REDIS_URL · PORT · FRONTEND_URL
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx               React Router route definitions
    │   ├── main.jsx              ReactDOM.createRoot entry point
    │   ├── index.css             All styles (CSS custom properties + component styles)
    │   ├── api/
    │   │   └── client.js         Axios wrapper — getTopics · startQuiz · submitAnswer
    │   │                         getSummary · getHistory
    │   └── pages/
    │       ├── Home.jsx          Topic selection + 📊 History nav link
    │       ├── Difficulty.jsx    Easy / Medium / Hard picker
    │       ├── Quiz.jsx          Question card · answer options · feedback banner
    │       ├── Summary.jsx       Score ring · answer review · recommendations
    │       └── History.jsx       Stats bar · quiz record cards · Retry button
    ├── vite.config.js            Dev server + /api proxy to :3001
    └── index.html
```

---

## Environment Variables

| Variable | Default | Used by |
|----------|---------|--------|
| `DATABASE_URL` | `postgresql://localhost/mathquiz` | postgres.js |
| `REDIS_URL` | `redis://localhost:6379` | redis.js |
| `FRONTEND_URL` | `http://localhost:5173` | CORS origin in Express |
| `PORT` | `3001` | Express listen |

---

## Starting the Stack

```sh
# Services (one-time, persists across reboots)
brew services start postgresql@16
brew services start redis

# Backend
cd quiz-app/backend
node src/index.js          # or: npm run dev  (nodemon)

# Frontend
cd quiz-app/frontend
npm run dev                # http://localhost:5173
```

### First-time database setup only
```sh
psql mathquiz -f migrations/001_init.sql   # create tables
psql mathquiz -f migrations/002_seed.sql   # load 60 questions
```
