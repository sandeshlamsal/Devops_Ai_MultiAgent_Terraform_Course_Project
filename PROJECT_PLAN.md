# Math Quiz App — Project Plan

A high school math practice quiz app built by a **multi-agent AI system** (Claude +
Ollama). Two agents collaborate to ship the product: a Business Analyst agent that defines
requirements and a Developer agent that generates the implementation.

---

## What the App Does

Students pick a math topic, answer a set of questions, and receive a summary at the end
showing their score, which answers were wrong, the correct solutions with explanations, and
topic-based recommendations for further practice.

### Core User Flow

```
[ Topic Selection ]
        │
        ▼
[ Quiz Session — N questions ]
  - Multiple choice
  - One question at a time
  - No time pressure
        │
        ▼
[ Summary Page ]
  - Score: X / N  (percentage)
  - Per-question breakdown: ✓ correct  ✗ wrong
  - For each wrong answer: correct solution + step-by-step explanation
  - Recommendations: topics to review based on weak areas
```

### Math Topics Covered

| Topic        | Example Questions                          |
|--------------|--------------------------------------------|
| Algebra      | Solve for x, linear equations, inequalities|
| Geometry     | Area, perimeter, angles, Pythagorean theorem|
| Trigonometry | Sin/cos/tan, unit circle basics            |
| Statistics   | Mean, median, mode, probability            |

---

## Multi-Agent Architecture

Two AI agents drive the project before any human writes a line of code:

```
┌────────────────────────────────────────┐
│        BUSINESS ANALYST AGENT          │
│           (Claude Sonnet)              │
│                                        │
│  Input:  High-level product brief      │
│  Output: User stories, data models,    │
│          API contracts, acceptance     │
│          criteria                      │
└──────────────────┬─────────────────────┘
                   │ structured requirements
                   ▼
┌────────────────────────────────────────┐
│          DEVELOPER AGENT               │
│       (Ollama gpt-oss:20b)             │
│                                        │
│  Input:  BA's structured requirements  │
│  Output: Component scaffolds, API      │
│          route stubs, DB migrations,   │
│          implementation notes          │
└──────────────────┬─────────────────────┘
                   │ code scaffolds + specs
                   ▼
┌────────────────────────────────────────┐
│           CRITIC AGENT                 │
│         (Claude Haiku)                 │
│                                        │
│  Input:  Developer output              │
│  Output: Code review, gaps flagged,    │
│          security notes, final plan    │
└────────────────────────────────────────┘
```

---

## Tech Stack

| Layer      | Technology     | Role                                         |
|------------|----------------|----------------------------------------------|
| Frontend   | React + Vite   | Quiz UI, summary page, topic selector        |
| Backend    | Node.js + Express | REST API, quiz logic, session handling    |
| Database   | PostgreSQL     | Questions, users, quiz sessions, results     |
| Cache      | Redis          | Active quiz state, session tokens, rate limit|
| AI Agents  | Claude + Ollama| BA agent, Developer agent, Critic agent      |

---

## Data Models (PostgreSQL)

### `topics`
```sql
id          SERIAL PRIMARY KEY
name        VARCHAR(100)          -- 'Algebra', 'Geometry', etc.
description TEXT
created_at  TIMESTAMP
```

### `questions`
```sql
id            SERIAL PRIMARY KEY
topic_id      INT REFERENCES topics(id)
question_text TEXT
option_a      TEXT
option_b      TEXT
option_c      TEXT
option_d      TEXT
correct_option CHAR(1)            -- 'a', 'b', 'c', or 'd'
explanation   TEXT                -- step-by-step solution shown after wrong answer
difficulty    VARCHAR(10)         -- 'easy', 'medium', 'hard'
created_at    TIMESTAMP
```

### `quiz_sessions`
```sql
id          UUID PRIMARY KEY
topic_id    INT REFERENCES topics(id)
started_at  TIMESTAMP
completed_at TIMESTAMP
total_q     INT
correct_q   INT
score_pct   NUMERIC(5,2)
```

### `session_answers`
```sql
id           SERIAL PRIMARY KEY
session_id   UUID REFERENCES quiz_sessions(id)
question_id  INT REFERENCES questions(id)
chosen_option CHAR(1)
is_correct   BOOLEAN
```

---

## Redis Usage

| Key Pattern                  | Type   | TTL     | Purpose                          |
|------------------------------|--------|---------|----------------------------------|
| `session:{uuid}:state`       | Hash   | 30 min  | Active quiz state (current q, answers so far) |
| `session:{uuid}:questions`   | List   | 30 min  | Shuffled question IDs for the session |
| `topic:{id}:questions`       | String | 1 hour  | Cached question pool per topic   |
| `ratelimit:{ip}`             | String | 1 min   | Request rate limiter             |

---

## API Design (Node/Express)

### Topics
```
GET  /api/topics                  List all available math topics
```

### Quiz Session
```
POST /api/quiz/start              Start a new session
     Body: { topicId, questionCount }
     Returns: { sessionId, firstQuestion }

GET  /api/quiz/:sessionId/question   Get current question (from Redis state)

POST /api/quiz/:sessionId/answer     Submit an answer
     Body: { questionId, chosenOption }
     Returns: { isCorrect, nextQuestion | null }
```

### Summary
```
GET  /api/quiz/:sessionId/summary
     Returns: {
       score, scorePercent,
       totalQuestions, correctCount, wrongCount,
       answers: [{ question, chosen, correct, explanation }],
       recommendations: [{ topic, reason }]
     }
```

---

## Frontend Components (React)

```
src/
├── pages/
│   ├── Home.jsx              Topic selection cards
│   ├── Quiz.jsx              Single question view + progress bar
│   └── Summary.jsx           Score, breakdown, recommendations
├── components/
│   ├── TopicCard.jsx         Clickable topic with icon + description
│   ├── QuestionCard.jsx      Question text + 4 answer options
│   ├── ProgressBar.jsx       X of N questions
│   ├── AnswerReview.jsx      Per-question result with explanation
│   └── RecommendationList.jsx Topics to study next
├── hooks/
│   └── useQuiz.js            Quiz session state management
├── api/
│   └── client.js             Axios wrapper for backend calls
└── main.jsx
```

---

## Recommendations Logic

Recommendations are generated at the end of each quiz based on wrong answers:

```
wrong answers grouped by topic subtag
  → if wrong rate > 50% on a subtag → add to recommendations
  → recommendation message: "Review [subtag] in [topic] — you got X/Y wrong"
```

This is simple rule-based logic on the backend. No ML needed.

---

## Implementation Phases

### Phase 1 — Agent Pipeline (Week 1)
- [ ] BA agent generates full requirements from the brief above
- [ ] Developer agent produces scaffolded code stubs from BA output
- [ ] Critic agent reviews and flags gaps
- [ ] Output: reviewed spec + scaffold committed to repo

### Phase 2 — Backend (Week 1–2)
- [ ] PostgreSQL schema + seed data (50 questions per topic)
- [ ] Redis connection + session management
- [ ] Express API routes (topics, start, answer, summary)
- [ ] Recommendations logic

### Phase 3 — Frontend (Week 2)
- [ ] Topic selection page
- [ ] Quiz page (one question at a time, progress bar)
- [ ] Summary page (score, breakdown, explanations, recommendations)
- [ ] API integration

### Phase 4 — Integration & Polish (Week 3)
- [ ] End-to-end testing
- [ ] Error states (session expired, network failure)
- [ ] Mobile-responsive layout
- [ ] Seed database with real high school math questions

---

## Project Structure (Target)

```
.
├── agents/                       # Multi-agent pipeline (existing)
│   ├── orchestrator.py
│   ├── researcher.py
│   ├── analyst.py
│   └── critic.py
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
│   │   │   ├── middleware/
│   │   │   │   └── rateLimit.js
│   │   │   └── index.js
│   │   ├── migrations/
│   │   │   └── 001_init.sql
│   │   ├── seed/
│   │   │   └── questions.sql
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── api/
│       │   └── main.jsx
│       ├── index.html
│       └── package.json
├── models/                       # Agent schemas (existing)
├── pipeline.py                   # Agent pipeline (existing)
├── PROJECT_PLAN.md               # This file
└── README.md
```

---

## What the Agents Will Generate

When the agent pipeline runs against this plan it will produce:

| Agent     | Output                                                            |
|-----------|-------------------------------------------------------------------|
| BA        | Detailed user stories, acceptance criteria per feature           |
| Developer | `001_init.sql`, `questions.sql` seed, route stubs, React component scaffolds |
| Critic    | Review notes, security gaps (SQL injection, session fixation), missing edge cases |

---

## Out of Scope (Kept Simple)

- No user authentication (sessions are anonymous)
- No leaderboard or social features
- No adaptive difficulty mid-quiz
- No timer
- No mobile app — responsive web only
- No AI-generated questions (questions are seeded, not generated at runtime)
