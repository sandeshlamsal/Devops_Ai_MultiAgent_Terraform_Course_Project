# Math Quiz Management System

A Grade 6 math practice quiz app built with a **multi-agent AI development pipeline**
(Claude + Ollama). Students practice Algebra and Geometry through interactive quizzes and
receive a detailed summary — score, wrong answers with solutions, and study recommendations.

---

## What the App Does

```
┌─────────────────────────────────────────────────────┐
│                  STUDENT FLOW                        │
│                                                      │
│  1. Pick a topic  →  Algebra  or  Geometry           │
│                                                      │
│  2. Answer 10 questions (multiple choice)            │
│     ┌──────────────────────────────────┐             │
│     │  Q3 of 10                        │             │
│     │  What is 3x + 5 = 14?            │             │
│     │  ○ x = 2                         │             │
│     │  ● x = 3  ✓                      │             │
│     │  ○ x = 4                         │             │
│     │  ○ x = 9                         │             │
│     └──────────────────────────────────┘             │
│                                                      │
│  3. View Summary                                     │
│     - Score: 7 / 10  (70%)                           │
│     - ✓ Correct: 7   ✗ Wrong: 3                      │
│     - Each wrong answer → correct solution shown     │
│     - Recommendations: topics to review              │
└─────────────────────────────────────────────────────┘
```

### Topics Covered (Grade 6)

| Topic    | Subtopics                                            |
|----------|------------------------------------------------------|
| Algebra  | Solve for x, linear equations, expressions, patterns |
| Geometry | Area, perimeter, angles, shapes, coordinate grids    |

---

## Multi-Agent Development Pipeline

Three AI agents act as the development team before a line of app code is written:

```
┌──────────────────────────────────────────────────────────────┐
│              BUSINESS ANALYST AGENT (Claude Sonnet)          │
│                                                              │
│  Input : Product brief (this document)                       │
│  Output: User stories · Data models · API contracts          │
│          Acceptance criteria · DB schema spec                │
└─────────────────────────┬────────────────────────────────────┘
                          │ Structured requirements
                          ▼
┌──────────────────────────────────────────────────────────────┐
│               DEVELOPER AGENT (Ollama gpt-oss:20b)           │
│                                                              │
│  Input : BA's requirements                                   │
│  Output: SQL migrations · Express route stubs                │
│          React component scaffolds · seed data               │
└─────────────────────────┬────────────────────────────────────┘
                          │ Code scaffolds + specs
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                  CRITIC AGENT (Claude Haiku)                 │
│                                                              │
│  Input : Developer output                                    │
│  Output: Code review · Security gaps · Missing edge cases    │
│          Final approved spec                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer      | Technology         | Why                                              |
|------------|--------------------|--------------------------------------------------|
| Frontend   | React + Vite       | Fast, component-based quiz UI                    |
| Backend    | Node.js + Express  | REST API, quiz logic, session management         |
| Database   | PostgreSQL         | Stores questions, sessions, answers, results     |
| Cache      | Redis              | Active quiz state, session tokens, rate limiting |
| AI (cloud) | Claude Sonnet/Haiku| BA agent, Critic agent — reasoning & review      |
| AI (local) | Ollama gpt-oss:20b | Developer agent — free, private, offline         |

---

## Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (Vite)                        │
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│   │  Home Page   │  │  Quiz Page   │  │    Summary Page      │ │
│   │              │  │              │  │                      │ │
│   │ Topic cards  │  │ Question +   │  │ Score % · Breakdown  │ │
│   │ Algebra      │  │ 4 options    │  │ Wrong answers +      │ │
│   │ Geometry     │  │ Progress bar │  │ solutions            │ │
│   │              │  │              │  │ Recommendations      │ │
│   └──────────────┘  └──────────────┘  └──────────────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST API calls
┌───────────────────────────▼─────────────────────────────────────┐
│                  NODE.JS / EXPRESS BACKEND                       │
│                                                                  │
│  GET  /api/topics               List available topics            │
│  POST /api/quiz/start           Start session, load questions    │
│  GET  /api/quiz/:id/question    Get current question             │
│  POST /api/quiz/:id/answer      Submit answer, advance           │
│  GET  /api/quiz/:id/summary     Get final results                │
└────────────┬──────────────────────────┬──────────────────────────┘
             │                          │
┌────────────▼──────────┐  ┌────────────▼──────────────────────────┐
│     PostgreSQL         │  │              Redis                    │
│                        │  │                                       │
│  topics                │  │  session:{uuid}:state   (30 min TTL) │
│  questions             │  │  session:{uuid}:questions            │
│  quiz_sessions         │  │  topic:{id}:questions   (1 hr TTL)   │
│  session_answers       │  │  ratelimit:{ip}         (1 min TTL)  │
└────────────────────────┘  └───────────────────────────────────────┘
```

---

## Database Schema

### `topics`
```sql
id          SERIAL PRIMARY KEY
name        VARCHAR(100)    -- 'Algebra', 'Geometry'
description TEXT
```

### `questions`
```sql
id             SERIAL PRIMARY KEY
topic_id       INT REFERENCES topics(id)
question_text  TEXT
option_a       TEXT
option_b       TEXT
option_c       TEXT
option_d       TEXT
correct_option CHAR(1)     -- 'a' | 'b' | 'c' | 'd'
explanation    TEXT        -- step-by-step solution (shown after wrong answer)
difficulty     VARCHAR(10) -- 'easy' | 'medium' | 'hard'
```

### `quiz_sessions`
```sql
id            UUID PRIMARY KEY
topic_id      INT REFERENCES topics(id)
started_at    TIMESTAMP
completed_at  TIMESTAMP
total_q       INT
correct_q     INT
score_pct     NUMERIC(5,2)
```

### `session_answers`
```sql
id             SERIAL PRIMARY KEY
session_id     UUID REFERENCES quiz_sessions(id)
question_id    INT REFERENCES questions(id)
chosen_option  CHAR(1)
is_correct     BOOLEAN
```

---

## API Reference

| Method | Endpoint                        | Description                                      |
|--------|---------------------------------|--------------------------------------------------|
| GET    | `/api/topics`                   | List all topics (Algebra, Geometry)              |
| POST   | `/api/quiz/start`               | Start quiz `{ topicId, questionCount }`          |
| GET    | `/api/quiz/:sessionId/question` | Get current question from Redis state            |
| POST   | `/api/quiz/:sessionId/answer`   | Submit answer `{ questionId, chosenOption }`     |
| GET    | `/api/quiz/:sessionId/summary`  | Final summary with score, solutions, recs        |

### Summary Response Shape
```json
{
  "score": 7,
  "scorePercent": 70,
  "totalQuestions": 10,
  "correctCount": 7,
  "wrongCount": 3,
  "answers": [
    {
      "question": "What is 3x + 5 = 14?",
      "chosen": "x = 2",
      "correct": "x = 3",
      "explanation": "Subtract 5 from both sides: 3x = 9. Divide by 3: x = 3.",
      "isCorrect": false
    }
  ],
  "recommendations": [
    { "topic": "Linear Equations", "reason": "Missed 2 of 3 questions on solving for x" }
  ]
}
```

---

## Frontend Components

```
src/
├── pages/
│   ├── Home.jsx           Topic selection (Algebra / Geometry cards)
│   ├── Quiz.jsx           One question at a time + progress bar
│   └── Summary.jsx        Score, per-question review, recommendations
├── components/
│   ├── TopicCard.jsx      Clickable card with topic name + icon
│   ├── QuestionCard.jsx   Question text + 4 answer option buttons
│   ├── ProgressBar.jsx    "Question 3 of 10" visual indicator
│   ├── AnswerReview.jsx   Shows chosen vs correct + explanation
│   └── RecommendationList.jsx  Topics to study next
├── hooks/
│   └── useQuiz.js         Session state, answer submission, navigation
└── api/
    └── client.js          Axios wrapper for all backend calls
```

---

## Redis Usage

| Key                          | Type   | TTL    | Stores                                   |
|------------------------------|--------|--------|------------------------------------------|
| `session:{uuid}:state`       | Hash   | 30 min | Current question index, answers so far   |
| `session:{uuid}:questions`   | List   | 30 min | Shuffled question ID order for session   |
| `topic:{id}:questions`       | String | 1 hr   | Cached question pool per topic           |
| `ratelimit:{ip}`             | String | 1 min  | Request count for rate limiting          |

---

## Recommendations Logic

Simple rule-based — no ML required:

```
For each wrong answer:
  → group by subtopic (e.g. "linear equations", "area of triangles")

For each subtopic group:
  → if wrong rate > 50%: add to recommendations
  → message: "Review [subtopic] — you got X of Y wrong"
```

---

## Project Structure

```
.
├── agents/                      # Multi-agent AI pipeline
│   ├── orchestrator.py          # Claude Sonnet — planning via tool use
│   ├── researcher.py            # Ollama — parallel local tasks
│   ├── analyst.py               # Claude Sonnet — synthesis + caching
│   └── critic.py                # Claude Haiku — review + scoring
├── models/
│   └── schemas.py               # Pydantic v2 inter-agent schemas
├── utils/
│   └── logger.py                # Rich colored console logger
├── quiz-app/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── topics.js
│   │   │   │   ├── quiz.js
│   │   │   │   └── summary.js
│   │   │   ├── db/
│   │   │   │   ├── postgres.js
│   │   │   │   └── redis.js
│   │   │   └── index.js
│   │   ├── migrations/
│   │   │   └── 001_init.sql
│   │   └── seed/
│   │       └── questions.sql    # 50+ Grade 6 math questions
│   └── frontend/
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── hooks/
│       │   └── api/
│       └── package.json
├── config.py
├── pipeline.py
├── main.py
├── requirements.txt
├── PROJECT_PLAN.md              # Implementation phases + task checklist
└── README.md
```

---

## Setup

**Prerequisites:** Python 3.11+, Node.js 18+, PostgreSQL, Redis, Ollama, Anthropic API key

```sh
# 1. Clone repo
cd Devops_Ai_MultiAgent_Terraform_Course_Project

# 2. Agent pipeline (Python)
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # add ANTHROPIC_API_KEY

# 3. Run agent pipeline to generate scaffold
python main.py

# 4. Backend
cd quiz-app/backend
npm install
npm run migrate               # runs 001_init.sql
npm run seed                  # loads questions
npm start                     # http://localhost:3001

# 5. Frontend
cd quiz-app/frontend
npm install
npm run dev                   # http://localhost:5173
```

---

## Configuration

| Variable                     | Default                   | Description                          |
|------------------------------|---------------------------|--------------------------------------|
| `ANTHROPIC_API_KEY`          | _(required)_              | Anthropic API key                    |
| `OLLAMA_HOST`                | `http://localhost:11434`  | Ollama server address                |
| `OLLAMA_MODEL`               | `gpt-oss:20b`             | Local model for Developer agent      |
| `DATABASE_URL`               | _(required)_              | PostgreSQL connection string         |
| `REDIS_URL`                  | `redis://localhost:6379`  | Redis connection string              |
| `MAX_CONCURRENT_RESEARCHERS` | `3`                       | Max parallel Ollama agent calls      |

---

## Out of Scope

- No user login or accounts — sessions are anonymous
- No timer or time pressure
- No leaderboard or social features
- No adaptive difficulty mid-quiz
- No AI-generated questions — all questions are seeded
- No mobile app — responsive web only
