# Math Quiz — Multi-Agent AI + DevOps Project

A **Texas Grade 6 TEKS-aligned** math practice quiz application built end-to-end by a
**multi-agent AI pipeline** (Claude + Ollama). The app covers 5 curriculum topics,
150 questions across 3 difficulty levels, student accounts with progress tracking,
and a full admin panel — all containerised with Docker and published to GitHub Container Registry.

---

## Table of Contents

1. [What the App Does](#what-the-app-does)
2. [Multi-Agent AI Pipeline](#multi-agent-ai-pipeline)
3. [Technology Stack](#technology-stack)
4. [Application Architecture](#application-architecture)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Docker & Containerisation](#docker--containerisation)
8. [GHCR Image Registry](#ghcr-image-registry)
9. [GitHub Actions CI/CD](#github-actions-cicd)
10. [Deployment — Docker Desktop](#deployment--docker-desktop)
11. [Environment Variables](#environment-variables)
12. [Project Structure](#project-structure)
13. [Local Development (without Docker)](#local-development-without-docker)
14. [Default Credentials](#default-credentials)

---

## What the App Does

### Student Flow

```
┌──────────────────────────────────────────────────────────────┐
│  1. REGISTER / LOGIN  (optional — anonymous play supported)  │
├──────────────────────────────────────────────────────────────┤
│  2. FORMULA SHEET  — review formulas before practising       │
├──────────────────────────────────────────────────────────────┤
│  3. PICK TOPIC                                               │
│     𝑥 Algebra · △ Geometry · ± Number & Operations          │
│     % Proportionality · 📊 Data & Statistics                 │
├──────────────────────────────────────────────────────────────┤
│  4. PICK DIFFICULTY                                          │
│     🟢 Easy  →  🟡 Medium  →  🔴 Hard                       │
├──────────────────────────────────────────────────────────────┤
│  5. ANSWER 10 QUESTIONS (multiple choice, shuffled)          │
│     ✓ Correct → green feedback + explanation                 │
│     ✗ Wrong   → red feedback + step-by-step solution         │
├──────────────────────────────────────────────────────────────┤
│  6. SUMMARY PAGE                                             │
│     Score %  ·  Correct / Wrong breakdown                    │
│     All wrong answers with solutions                         │
│     Study recommendations                                    │
├──────────────────────────────────────────────────────────────┤
│  7. STUDENT DASHBOARD (logged-in users)                      │
│     Personal stats · Topic progress bars · Quiz history      │
└──────────────────────────────────────────────────────────────┘
```

### Admin Flow

```
┌──────────────────────────────────────────────────────────────┐
│  ADMIN LOGIN  →  admin@mathquiz.com / Admin@123              │
├──────────────────────────────────────────────────────────────┤
│  📊 DASHBOARD                                                │
│     Total students · Quizzes taken · Average score           │
│     Quizzes this week · Topic performance bars               │
├──────────────────────────────────────────────────────────────┤
│  👥 STUDENTS                                                 │
│     Searchable table with avg score progress bar per student │
│     Click student → topic breakdown + full quiz history      │
├──────────────────────────────────────────────────────────────┤
│  ❓ QUESTIONS                                                │
│     Filter by topic + difficulty                             │
│     Add / Edit / Delete questions with live form             │
└──────────────────────────────────────────────────────────────┘
```

### Topics — Texas Grade 6 TEKS

| Topic | TEKS | Questions |
|-------|------|-----------|
| 𝑥 Algebra | 6, 7, 9, 10 | 30 (Easy / Medium / Hard) |
| △ Geometry | 8 | 30 |
| ± Number & Operations | 2, 3 | 30 |
| % Proportionality | 4, 5 | 30 |
| 📊 Data & Statistics | 12, 13 | 30 |
| **Total** | | **150 questions** |

---

## Multi-Agent AI Pipeline

Three AI agents act as the development team before any app code is written:

```
┌─────────────────────────────────────────────────────────────────┐
│           BUSINESS ANALYST AGENT  (Claude Sonnet)               │
│  Input : Product brief                                          │
│  Output: User stories · API contracts · DB schema spec          │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Structured requirements
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│            DEVELOPER AGENT  (Ollama gpt-oss:20b — local)        │
│  Input : BA requirements                                        │
│  Output: SQL migrations · Route stubs · React scaffolds         │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Code scaffolds
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              CRITIC AGENT  (Claude Haiku)                       │
│  Input : Developer output                                       │
│  Output: Code review · Security gaps · Final approved spec      │
└─────────────────────────────────────────────────────────────────┘
```

The agent pipeline also demonstrates:
- **Orchestrator** (Claude Sonnet) — task decomposition via forced tool use (`plan_research`)
- **Researcher** (Ollama) — concurrent subtask processing with `asyncio.Semaphore`
- **Analyst** (Claude Sonnet) — synthesis with prompt caching (`cache_control: ephemeral`)
- **Critic** (Claude Haiku) — cost-optimised quality review

Run the pipeline:
```sh
source .venv/bin/activate
python main.py "Texas Grade 6 math quiz platform"
```

---

## Technology Stack

### Application

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | React | 18 | Component-based quiz UI |
| Build tool | Vite | 5 | Fast dev server + production build |
| Routing | React Router | v6 | Client-side navigation |
| HTTP client | Axios | 1.x | API calls with JWT interceptor |
| Backend | Node.js | 18 | Server runtime |
| API framework | Express | 4 | REST API |
| Authentication | jsonwebtoken | 9 | JWT token generation/verification |
| Password hashing | bcryptjs | 2 | Bcrypt with salt rounds 10 |
| Database | PostgreSQL | 16 | Persistent data storage |
| Cache | Redis | 7 | Active quiz session state (30-min TTL) |
| ORM/Driver | pg (node-postgres) | 8 | PostgreSQL client |
| Redis client | ioredis | 5 | Redis client with helper wrappers |

### AI / Agent Layer

| Tool | Model | Role |
|------|-------|------|
| Claude API (Anthropic) | `claude-sonnet-4-6` | Orchestrator, Analyst agents |
| Claude API (Anthropic) | `claude-haiku-4-5-20251001` | Critic agent (cost-optimised) |
| Ollama (local) | `gpt-oss:20b` | Developer / Researcher agent (free, private) |
| Anthropic Python SDK | latest | Agent pipeline |
| Pydantic v2 | 2.x | Typed inter-agent data schemas |

### DevOps & Infrastructure

| Tool | Purpose |
|------|---------|
| Docker | Container runtime |
| Docker Compose | Multi-container orchestration |
| Docker Desktop | Local deployment target |
| GitHub Container Registry (GHCR) | Image registry (`ghcr.io`) |
| GitHub Actions | CI/CD pipeline — build & push on every `main` push |
| Nginx | Serves built React app + proxies `/api` to backend |
| Homebrew | macOS package manager (PostgreSQL, Redis, Ollama) |
| dotenvx | Environment variable management |

---

## Application Architecture

```
                    ┌─────────────────────────────────┐
                    │   BROWSER  http://localhost:3000  │
                    └──────────────┬──────────────────┘
                                   │ HTTP
                    ┌──────────────▼──────────────────┐
                    │    NGINX (quiz-frontend:80)       │
                    │  • Serves React build (dist/)    │
                    │  • Proxy /api → backend:3001     │
                    │  • React Router fallback         │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │  NODE/EXPRESS  (quiz-backend)    │
                    │  http://localhost:3001           │
                    │                                 │
                    │  /api/auth/*    — JWT auth       │
                    │  /api/topics    — topic list     │
                    │  /api/quiz/*    — quiz engine    │
                    │  /api/student/* — student data   │
                    │  /api/admin/*   — admin panel    │
                    │  /api/history   — score history  │
                    └────────────┬─────────┬──────────┘
                                 │         │
               ┌─────────────────▼──┐  ┌───▼──────────────────┐
               │   POSTGRESQL       │  │   REDIS              │
               │   quiz-postgres    │  │   quiz-redis         │
               │                    │  │                      │
               │  users             │  │  session:{uuid}      │
               │  topics            │  │  TTL: 30 minutes     │
               │  questions (150)   │  │  (active quiz state) │
               │  quiz_sessions     │  │                      │
               │  session_answers   │  └──────────────────────┘
               └────────────────────┘
```

---

## Database Schema

```sql
-- Users (students + admins)
users
  id          SERIAL PRIMARY KEY
  name        VARCHAR(100)
  email       VARCHAR(255) UNIQUE
  password    VARCHAR(255)        -- bcrypt hash, 10 rounds
  role        VARCHAR(10)         -- 'student' | 'admin'
  created_at  TIMESTAMP
  last_login  TIMESTAMP

-- Curriculum topics
topics
  id          SERIAL PRIMARY KEY
  name        VARCHAR(100)        -- 'Algebra', 'Geometry', etc.
  description TEXT
  icon        VARCHAR(10)
  color       VARCHAR(20)

-- Question bank (150 rows)
questions
  id             SERIAL PRIMARY KEY
  topic_id       INT → topics.id
  difficulty     VARCHAR(10)        -- 'easy' | 'medium' | 'hard'
  question_text  TEXT
  option_a/b/c/d TEXT
  correct_option CHAR(1)            -- 'a' | 'b' | 'c' | 'd'
  explanation    TEXT

-- Quiz sessions (anonymous or linked to user)
quiz_sessions
  id            UUID PRIMARY KEY
  user_id       INT → users.id      -- NULL for anonymous
  topic_id      INT → topics.id
  difficulty    VARCHAR(10)
  started_at    TIMESTAMP
  completed_at  TIMESTAMP           -- NULL = in progress
  total_q       INT
  correct_q     INT
  score_pct     NUMERIC(5,2)

-- Per-answer records (written immediately on submit)
session_answers
  id             SERIAL PRIMARY KEY
  session_id     UUID → quiz_sessions.id
  question_id    INT → questions.id
  question_text  TEXT               -- denormalised snapshot
  option_a/b/c/d TEXT               -- denormalised snapshot
  chosen_option  CHAR(1)
  correct_option CHAR(1)
  is_correct     BOOLEAN
  explanation    TEXT
  answered_at    TIMESTAMP
```

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Register student `{ name, email, password }` |
| POST | `/api/auth/login` | None | Login → returns JWT token |
| GET | `/api/auth/me` | Bearer | Get current user profile |

### Public Quiz

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/topics` | None | List all 5 topics |
| POST | `/api/quiz/start` | Optional | Start session `{ topicId, difficulty }` |
| POST | `/api/quiz/:id/answer` | None | Submit answer `{ chosenOption }` |
| GET | `/api/quiz/:id/summary` | None | Final results with explanations |
| GET | `/api/history` | None | Last 50 completed sessions (all users) |

### Student (requires login)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/student/stats` | Bearer | Personal avg score, topic breakdown |
| GET | `/api/student/history` | Bearer | Own quiz history |

### Admin (requires admin role)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/students` | Admin | All students with progress |
| GET | `/api/admin/students/:id/progress` | Admin | Single student detail |
| GET | `/api/admin/questions` | Admin | Question list (filterable) |
| POST | `/api/admin/questions` | Admin | Add new question |
| PUT | `/api/admin/questions/:id` | Admin | Edit question |
| DELETE | `/api/admin/questions/:id` | Admin | Delete question |

---

## Docker & Containerisation

### Images

Three custom Docker images are built for this project:

#### `quiz-postgres`
```dockerfile
FROM postgres:16-alpine
# Bakes migrations directly into the image
# Runs automatically on first container start via /docker-entrypoint-initdb.d/
COPY migrations/001_init.sql   /docker-entrypoint-initdb.d/01_init.sql
COPY migrations/002_seed.sql   /docker-entrypoint-initdb.d/02_seed.sql
COPY migrations/003_users.sql  /docker-entrypoint-initdb.d/03_users.sql
```
No volume mounts needed for schema — migrations run on first boot, schema is idempotent.

#### `quiz-backend`
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production      # production deps only
COPY src/        ./src/
COPY migrations/ ./migrations/    # runtime migration runner
EXPOSE 3001
CMD ["node", "src/index.js"]
```
Backend reads migrations at startup, runs any new `.sql` files, then seeds the default admin.

#### `quiz-frontend`
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build                 # Vite production build → /app/dist

# Stage 2: Serve
FROM nginx:1.25-alpine
COPY --from=builder /app/dist  /usr/share/nginx/html
COPY nginx.conf                /etc/nginx/conf.d/default.conf
EXPOSE 80
```
Multi-stage build: only the static `dist/` folder is copied to the nginx image.

### Nginx Configuration
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;

  # React Router — all routes serve index.html
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Proxy API calls to backend service
  location /api/ {
    proxy_pass http://backend:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

### docker-compose.yml

```yaml
services:
  postgres:                               # Custom image with baked-in migrations
    build: ./quiz-app/postgres
    image: ghcr.io/sandeshlamsal/quiz-postgres:latest
    environment:
      POSTGRES_DB: mathquiz
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: pg_isready -U postgres -d mathquiz
      interval: 5s  retries: 10

  redis:
    image: redis:7-alpine
    healthcheck:
      test: redis-cli ping
      interval: 5s  retries: 10

  backend:
    build: ./quiz-app/backend
    image: ghcr.io/sandeshlamsal/quiz-backend:latest
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/mathquiz
      REDIS_URL:    redis://redis:6379
      JWT_SECRET:   change-this-in-production
      PORT:         3001
    depends_on:
      postgres: { condition: service_healthy }
      redis:    { condition: service_healthy }

  frontend:
    build: ./quiz-app/frontend
    image: ghcr.io/sandeshlamsal/quiz-frontend:latest
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Key design decisions:**
- `postgres_data` volume persists data across container restarts
- `healthcheck` on postgres and redis ensures backend only starts when they're ready
- No volume mount for migrations — SQL is baked into the postgres image
- `/Users` is whitelisted in Docker Desktop file sharing

---

## GHCR Image Registry

Images are published to **GitHub Container Registry** (`ghcr.io`) under the repository owner's namespace.

### Image URLs

```
ghcr.io/sandeshlamsal/quiz-postgres:latest
ghcr.io/sandeshlamsal/quiz-backend:latest
ghcr.io/sandeshlamsal/quiz-frontend:latest
```

### Pull images manually

```sh
# Authenticate with GHCR (uses GitHub Personal Access Token)
echo $GITHUB_TOKEN | docker login ghcr.io -u sandeshlamsal --password-stdin

# Pull all images
docker pull ghcr.io/sandeshlamsal/quiz-postgres:latest
docker pull ghcr.io/sandeshlamsal/quiz-backend:latest
docker pull ghcr.io/sandeshlamsal/quiz-frontend:latest
```

### Run from registry (no local build needed)

```sh
# Edit docker-compose.yml to remove 'build:' keys, then:
docker compose up -d
```

---

## GitHub Actions CI/CD

### Workflow: `.github/workflows/docker-publish.yml`

Triggers on every push to `main` branch.

```
Push to main
      │
      ▼
┌─────────────────────────────────────┐
│  actions/checkout@v4                │
├─────────────────────────────────────┤
│  docker/login-action@v3             │
│  Registry: ghcr.io                 │
│  Username: ${{ github.actor }}      │
│  Password: ${{ secrets.GITHUB_TOKEN }}│
│  (no manual secrets needed)        │
├─────────────────────────────────────┤
│  docker/setup-buildx-action@v3     │
│  (enables layer caching)           │
├─────────────────────────────────────┤
│  Build & push quiz-postgres:latest  │
├─────────────────────────────────────┤
│  Build & push quiz-backend:latest   │
├─────────────────────────────────────┤
│  Build & push quiz-frontend:latest  │
├─────────────────────────────────────┤
│  Write job summary with image URLs  │
└─────────────────────────────────────┘
```

**Features:**
- `GITHUB_TOKEN` is used automatically — no manual PAT needed for registry access
- `cache-from: type=gha` / `cache-to: type=gha,mode=max` — GitHub Actions layer cache
- `workflow` scope required on PAT to push workflow files (`gh auth refresh -s workflow`)

**Monitor runs:**
```
https://github.com/sandeshlamsal/Devops_Ai_MultiAgent_Terraform_Course_Project/actions
```

---

## Deployment — Docker Desktop

### Prerequisites

| Requirement | Version | Install |
|------------|---------|---------|
| Docker Desktop | 4.x+ | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) |
| Git | any | `brew install git` |

### Recommended Docker Desktop Settings

| Setting | Value | Why |
|---------|-------|-----|
| Virtualization Framework | ✅ Enabled | Replaces HyperKit — no more VM crashes |
| VirtioFS | ✅ Enabled | Faster file sharing |
| Memory | 4 GB | Stable for 32 GB machine |
| CPUs | 4 | Balanced |
| File Sharing | `/Users`, `/Volumes`, `/private` | Covers all project paths |

### Deploy

```sh
# 1. Clone the repository
git clone https://github.com/sandeshlamsal/Devops_Ai_MultiAgent_Terraform_Course_Project.git
cd Devops_Ai_MultiAgent_Terraform_Course_Project

# 2. Start Docker Desktop and wait for the whale icon to be solid

# 3. Build images and start all containers
docker compose up --build -d

# 4. Verify all 4 containers are running
docker compose ps

# 5. Open the app
open http://localhost:3000
```

### Container Ports

| Container | Image | Internal Port | External Port |
|-----------|-------|---------------|---------------|
| postgres | quiz-postgres | 5432 | 5432 |
| redis | redis:7-alpine | 6379 | 6379 |
| backend | quiz-backend | 3001 | 3001 |
| frontend | quiz-frontend | 80 | **3000** |

### Verify deployment

```sh
# All containers healthy
docker compose ps

# API responding
curl http://localhost:3001/api/topics

# Question count in DB
docker exec <postgres-container> psql -U postgres -d mathquiz \
  -c "SELECT COUNT(*) FROM questions;"
# Expected: 150

# App in browser
open http://localhost:3000
```

### Useful commands

```sh
# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Restart a single service
docker compose restart backend

# Stop everything (keep data)
docker compose down

# Stop and wipe all data (full reset)
docker compose down -v

# Rebuild after code changes
docker compose up --build -d
```

---

## Environment Variables

### Backend (`.env` in `quiz-app/backend/`)

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `DATABASE_URL` | — | ✅ | PostgreSQL connection string |
| `REDIS_URL` | `redis://localhost:6379` | ✅ | Redis connection string |
| `JWT_SECRET` | `mathquiz-dev-secret-2024` | ✅ prod | JWT signing secret — change in production |
| `PORT` | `3001` | | Express server port |
| `FRONTEND_URL` | `http://localhost:5173` | | CORS allowed origin |
| `ADMIN_EMAIL` | `admin@mathquiz.com` | | Default admin email (seeded on first boot) |
| `ADMIN_PASSWORD` | `Admin@123` | | Default admin password (seeded on first boot) |

### AI Agent Pipeline (`.env` in project root)

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | — | Anthropic API key (required for agents) |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama server address |
| `OLLAMA_MODEL` | `gpt-oss:20b` | Local model for Developer agent |
| `MAX_CONCURRENT_RESEARCHERS` | `3` | Semaphore limit for parallel Ollama calls |

---

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── docker-publish.yml        # CI/CD: build & push to GHCR on main push
│
├── agents/                           # Multi-agent AI pipeline (Python)
│   ├── orchestrator.py               # Claude Sonnet — tool-use task decomposition
│   ├── researcher.py                 # Ollama — concurrent async research
│   ├── analyst.py                    # Claude Sonnet — synthesis + prompt caching
│   └── critic.py                     # Claude Haiku — quality review + scoring
│
├── models/
│   └── schemas.py                    # Pydantic v2 inter-agent data contracts
│
├── utils/
│   └── logger.py                     # Rich console logger (colour-coded per agent)
│
├── quiz-app/
│   ├── postgres/
│   │   ├── Dockerfile                # postgres:16-alpine + baked-in migrations
│   │   └── migrations/               # SQL files copied into initdb.d
│   │
│   ├── backend/
│   │   ├── Dockerfile                # node:18-alpine production image
│   │   ├── .dockerignore
│   │   ├── .env                      # local env (not committed)
│   │   ├── package.json
│   │   ├── migrations/
│   │   │   ├── 001_init.sql          # Tables + indexes
│   │   │   ├── 002_seed.sql          # 5 topics + 150 questions (Texas TEKS)
│   │   │   └── 003_users.sql         # users table + user_id on quiz_sessions
│   │   └── src/
│   │       ├── index.js              # Express app + boot (migrations → seed admin)
│   │       ├── middleware/
│   │       │   └── auth.js           # JWT authenticate / optionalAuth / requireAdmin
│   │       ├── routes/
│   │       │   ├── auth.js           # /register, /login, /me
│   │       │   ├── admin.js          # /stats, /students, /questions CRUD
│   │       │   └── student.js        # /stats, /history (own data only)
│   │       └── db/
│   │           ├── postgres.js       # pg.Pool connection
│   │           └── redis.js          # ioredis + setSession/getSession/deleteSession
│   │
│   ├── frontend/
│   │   ├── Dockerfile                # Multi-stage: node build → nginx serve
│   │   ├── .dockerignore
│   │   ├── nginx.conf                # React Router fallback + /api proxy
│   │   ├── vite.config.js            # Dev proxy → localhost:3001
│   │   ├── package.json
│   │   └── src/
│   │       ├── App.jsx               # React Router v6 routes
│   │       ├── main.jsx              # ReactDOM.createRoot entry
│   │       ├── index.css             # All styles (CSS custom properties)
│   │       ├── context/
│   │       │   └── AuthContext.jsx   # JWT state, login(), logout()
│   │       ├── components/
│   │       │   └── ProtectedRoute.jsx # RequireAuth, RequireAdmin, RedirectIfAuth
│   │       ├── api/
│   │       │   └── client.js         # Axios + JWT interceptor + all API calls
│   │       └── pages/
│   │           ├── Home.jsx          # 5 topic cards + nav links
│   │           ├── Difficulty.jsx    # Easy / Medium / Hard picker
│   │           ├── Quiz.jsx          # Question card, answer, feedback
│   │           ├── Summary.jsx       # Score ring, review, recommendations
│   │           ├── History.jsx       # All sessions with stats
│   │           ├── FormulaSheet.jsx  # TEKS formula reference (tabbed)
│   │           ├── Login.jsx         # Email + password form
│   │           ├── Register.jsx      # Student registration
│   │           ├── StudentDashboard.jsx # Personal stats + progress
│   │           └── admin/
│   │               ├── AdminLayout.jsx   # Sidebar nav + Sign Out
│   │               ├── AdminDashboard.jsx # Stats + topic bars
│   │               ├── AdminStudents.jsx  # Student table + detail modal
│   │               └── AdminQuestions.jsx # Question CRUD + filter
│   │
│   └── ARCHITECTURE.md               # Detailed data flow documentation
│
├── docker-compose.yml                # 4-container stack definition
├── config.py                         # Agent pipeline config (env-driven)
├── pipeline.py                       # Async agent orchestration
├── main.py                           # CLI entry point (Rich terminal output)
├── requirements.txt                  # Python deps (anthropic, ollama, pydantic, rich)
├── .env.example                      # Template for environment variables
├── .gitignore                        # Excludes node_modules, .venv, .env, dist
├── PROJECT_PLAN.md                   # Implementation phases + task checklist
└── README.md                         # This file
```

---

## Local Development (without Docker)

```sh
# Prerequisites: Node 18+, Python 3.11+, PostgreSQL 16, Redis 7, Ollama

# 1. PostgreSQL
createdb mathquiz
psql mathquiz -f quiz-app/backend/migrations/001_init.sql
psql mathquiz -f quiz-app/backend/migrations/002_seed.sql
psql mathquiz -f quiz-app/backend/migrations/003_users.sql

# 2. Backend
cd quiz-app/backend
cp .env.example .env   # set DATABASE_URL and REDIS_URL
npm install
node src/index.js      # http://localhost:3001

# 3. Frontend
cd quiz-app/frontend
npm install
npm run dev            # http://localhost:5173

# 4. AI Agent pipeline (optional)
cd ../..
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set ANTHROPIC_API_KEY
python main.py

# 5. Ollama (for Developer agent)
ollama serve
ollama pull gpt-oss:20b
```

---

## Default Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | `admin@mathquiz.com` | `Admin@123` | Full admin panel, all student data, question management |
| **Student** | register at `/register` | your choice | Own dashboard and quiz history only |

> **Note:** The admin account is created automatically on the first backend boot if no admin exists.
> Change credentials via environment variables `ADMIN_EMAIL` and `ADMIN_PASSWORD` before deploying to production.
> Always set a strong `JWT_SECRET` in production.

---

## Database Migrations & Seed Process

### How Migrations Work

```
boot()
  │
  ├── runMigrations()
  │     Reads every *.sql file in /migrations/ in alphabetical order
  │     Runs each against PostgreSQL
  │     Errors are caught and logged as warnings (idempotent SQL)
  │
  └── seedAdmin()
        Checks: SELECT id FROM users WHERE role='admin'
        If none found → bcrypt.hash(ADMIN_PASSWORD) → INSERT admin user
        If found → skip (never overwrites existing admin)
```

### Migration Files

| File | Purpose | Idempotent |
|------|---------|-----------|
| `001_init.sql` | Creates all tables + indexes using `CREATE TABLE IF NOT EXISTS` | ✅ |
| `002_seed.sql` | Inserts 5 topics + 150 questions using `ON CONFLICT DO NOTHING` | ✅ |
| `003_users.sql` | Adds `users` table + `user_id` column via `ADD COLUMN IF NOT EXISTS` | ✅ |

All migrations use **idempotent SQL** — safe to run multiple times without side effects.

### Adding a New Migration

```sh
# 1. Create a new numbered file
touch quiz-app/backend/migrations/004_new_feature.sql

# Write idempotent SQL
cat > quiz-app/backend/migrations/004_new_feature.sql << 'EOF'
ALTER TABLE questions ADD COLUMN IF NOT EXISTS tags TEXT[];
CREATE INDEX IF NOT EXISTS idx_questions_tags ON questions USING GIN(tags);
EOF

# 2. Sync to postgres Docker build context
cp quiz-app/backend/migrations/004_new_feature.sql \
   quiz-app/postgres/migrations/004_new_feature.sql

# 3. Rebuild postgres image + restart backend
docker compose up --build -d postgres backend
```

---

### Running Migrations on a Live Running System

> **No full stack restart needed.** All SQL is idempotent — safe to apply against a running database.

#### Method 1 — Directly inside the running Postgres container

```sh
# Get the container name
docker compose ps

# Apply a single migration file
docker exec -i devops_ai_multiagent_terraform_course_project-postgres-1 \
  psql -U postgres -d mathquiz \
  < quiz-app/backend/migrations/004_new_feature.sql

# Verify the change
docker exec devops_ai_multiagent_terraform_course_project-postgres-1 \
  psql -U postgres -d mathquiz -c "\d questions"
```

#### Method 2 — Via psql from your local machine (Postgres must be port-exposed)

```sh
psql postgresql://postgres:postgres@localhost:5432/mathquiz \
  -f quiz-app/backend/migrations/004_new_feature.sql
```

#### Method 3 — Restart only the backend (triggers `runMigrations()` automatically)

```sh
# Backend re-runs all *.sql files on startup (idempotent — no duplicate data)
docker compose restart backend

# Watch the migration logs
docker compose logs -f backend
# Expected output:
#   Migration OK: 001_init.sql
#   Migration OK: 002_seed.sql
#   Migration OK: 003_users.sql
#   Migration OK: 004_new_feature.sql   ← new file picked up
#   Quiz API → http://localhost:3001
```

#### Verify migration applied correctly

```sh
# Check table structure
docker exec devops_ai_multiagent_terraform_course_project-postgres-1 \
  psql -U postgres -d mathquiz -c "\d+ questions"

# Check indexes
docker exec devops_ai_multiagent_terraform_course_project-postgres-1 \
  psql -U postgres -d mathquiz -c "\di"

# Check row counts (should never change from migration)
docker exec devops_ai_multiagent_terraform_course_project-postgres-1 \
  psql -U postgres -d mathquiz \
  -c "SELECT COUNT(*) FROM questions; SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM quiz_sessions;"
```

---

### Running Seed Data on an Already-Running System

> The seed file uses `ON CONFLICT DO NOTHING` — safe to run against a populated database.
> Existing rows are skipped. Only genuinely new rows are inserted.

#### Add new questions to live DB

```sh
# Safe — existing 150 questions untouched, only new rows inserted
docker exec -i devops_ai_multiagent_terraform_course_project-postgres-1 \
  psql -U postgres -d mathquiz \
  < quiz-app/backend/migrations/002_seed.sql

# Confirm question count
docker exec devops_ai_multiagent_terraform_course_project-postgres-1 \
  psql -U postgres -d mathquiz \
  -c "SELECT t.name, q.difficulty, COUNT(*) FROM questions q JOIN topics t ON t.id=q.topic_id GROUP BY t.name, q.difficulty ORDER BY t.name, q.difficulty;"
```

#### Add a single new question via psql

```sh
docker exec -it devops_ai_multiagent_terraform_course_project-postgres-1 \
  psql -U postgres -d mathquiz

-- Inside psql:
INSERT INTO questions
  (topic_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
VALUES
  (1, 'easy', 'What is x + 0?', 'x = 1', 'x', 'x = 0', 'undefined', 'b',
   'Adding 0 to any number leaves it unchanged: x + 0 = x');
\q
```

#### Add questions via Admin Panel (no SQL needed)

1. Open **http://localhost:3000/login**
2. Login as `admin@mathquiz.com` / `Admin@123`
3. Go to **❓ Questions → + Add Question**
4. Fill in topic, difficulty, options, correct answer, explanation → Save

---

### PostgreSQL Version Upgrade (e.g. 15 → 16, with no data loss)

#### Step 1 — Backup current data

```sh
# Dump entire database to a SQL file
docker exec devops_ai_multiagent_terraform_course_project-postgres-1 \
  pg_dump -U postgres mathquiz > backup-$(date +%Y%m%d-%H%M).sql

# Verify backup file is not empty
wc -l backup-*.sql
# Expected: thousands of lines

# Also backup the Docker volume as insurance
docker run --rm \
  -v devops_ai_multiagent_terraform_course_project_postgres_data:/data \
  -v $(pwd):/backup alpine \
  tar czf /backup/postgres-volume-$(date +%Y%m%d).tar.gz /data
```

#### Step 2 — Update the Postgres image version

```dockerfile
# quiz-app/postgres/Dockerfile
FROM postgres:16-alpine   ← change to postgres:17-alpine
```

#### Step 3 — Upgrade with zero data loss

```sh
# Stop the current stack (keeps volume intact)
docker compose down

# Remove old postgres image (volume data is safe — stored separately)
docker rmi devops_ai_multiagent_terraform_course_project-postgres-1

# Start new version — it will use the EXISTING volume
# PostgreSQL auto-runs initdb only if the data directory is EMPTY
docker compose up --build -d postgres
docker compose logs -f postgres
# Watch for: "database system is ready to accept connections"

# If Postgres refuses to start with new version (major version incompatibility):
# → restore from the SQL backup instead (Step 4)
```

#### Step 4 — Restore from backup (if volume is incompatible)

```sh
# Start fresh postgres with empty volume
docker compose down -v                    # ← wipes volume
docker compose up --build -d postgres
sleep 10                                  # wait for postgres to initialise

# Restore from SQL dump
docker exec -i devops_ai_multiagent_terraform_course_project-postgres-1 \
  psql -U postgres -d mathquiz < backup-20240115-1430.sql

# Verify row counts
docker exec devops_ai_multiagent_terraform_course_project-postgres-1 \
  psql -U postgres -d mathquiz \
  -c "SELECT 'topics' AS tbl, COUNT(*) FROM topics
      UNION ALL SELECT 'questions', COUNT(*) FROM questions
      UNION ALL SELECT 'users',     COUNT(*) FROM users
      UNION ALL SELECT 'sessions',  COUNT(*) FROM quiz_sessions;"

# Start remaining services
docker compose up -d
```

#### Step 5 — Verify upgrade

```sh
# Confirm Postgres version
docker exec devops_ai_multiagent_terraform_course_project-postgres-1 \
  psql -U postgres -c "SELECT version();"

# Confirm API still works
curl http://localhost:3001/api/topics
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mathquiz.com","password":"Admin@123"}'
```

#### PostgreSQL Upgrade — Decision Matrix

| Scenario | Upgrade Path |
|----------|-------------|
| Minor version (16.1 → 16.3) | Update image tag → `docker compose up --build -d postgres` — volume compatible |
| Major version (15 → 16) on same OS | Try volume first; fall back to dump/restore if data dir incompatible |
| Major version on different architecture | Always dump/restore |
| Production with zero downtime | Logical replication to new version → cutover → decommission old |

### Seed Data Details

```
002_seed.sql inserts:
  5 topics  (Algebra, Geometry, Number & Ops, Proportionality, Data & Stats)
  150 questions  (5 topics × 3 difficulties × 10 questions)

Each INSERT uses ON CONFLICT (id) DO NOTHING — safe to re-run.

Admin seeding (code, not SQL):
  Runs at backend startup via seedAdmin()
  Uses bcrypt.hash() at runtime — no plain passwords in SQL files
  Controlled by ADMIN_EMAIL / ADMIN_PASSWORD env vars
```

---

## Production Deployment — Zero Downtime & No Data Loss

### Architecture for Production

```
                        Internet
                            │
                    ┌───────▼────────┐
                    │  Load Balancer  │  (AWS ALB / Nginx / Traefik)
                    │  TLS termination│
                    └───────┬────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
      ┌───────▼──┐  ┌───────▼──┐  ┌──────▼───┐
      │frontend-1│  │frontend-2│  │frontend-3│  (nginx, stateless)
      └──────────┘  └──────────┘  └──────────┘
              │             │             │
              └─────────────┼─────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
      ┌───────▼──┐  ┌───────▼──┐  ┌──────▼───┐
      │backend-1 │  │backend-2 │  │backend-3 │  (Node, stateless)
      └──────────┘  └──────────┘  └──────────┘
                            │
              ┌─────────────┼─────────────┐
              │                           │
      ┌───────▼────────┐     ┌────────────▼──────┐
      │  PostgreSQL     │     │  Redis Cluster     │
      │  Primary +      │     │  (session cache)   │
      │  Read Replicas  │     └───────────────────┘
      └─────────────────┘
```

### Zero-Downtime Deployment Strategy

#### Option A — Rolling Update (Docker Swarm / Kubernetes)

```sh
# Build and push new images to GHCR
docker compose build
docker push ghcr.io/sandeshlamsal/quiz-backend:latest
docker push ghcr.io/sandeshlamsal/quiz-frontend:latest

# Rolling update — replaces containers one at a time
# Old containers keep serving until new ones pass health checks
docker service update --image ghcr.io/sandeshlamsal/quiz-backend:latest quiz_backend
docker service update --image ghcr.io/sandeshlamsal/quiz-frontend:latest quiz_frontend
```

#### Option B — Blue/Green Deployment

```sh
# 1. Deploy GREEN stack (new version) alongside BLUE (current)
docker compose -p quiz-green -f docker-compose.prod.yml up -d

# 2. Run smoke tests against GREEN
curl https://green.yourdomain.com/api/topics

# 3. Switch load balancer traffic from BLUE → GREEN
#    (nginx upstream, AWS ALB target group swap, etc.)

# 4. Keep BLUE running for 10 min (instant rollback if needed)
#    Then tear down BLUE
docker compose -p quiz-blue down
```

#### Migrations in Production (Zero Downtime)

The key rule: **migrations must be backward-compatible** with the running version.

```
Safe migration pattern (3-phase deploy):

Phase 1 — Add column (nullable, no default required in old code):
  ALTER TABLE questions ADD COLUMN IF NOT EXISTS tags TEXT[];
  → Deploy: old backend runs fine (ignores new column)

Phase 2 — Deploy new backend that reads/writes the new column
  → Both old and new queries work during rolling update

Phase 3 — Add NOT NULL constraint or backfill (after all instances updated)
  UPDATE questions SET tags = '{}' WHERE tags IS NULL;
  ALTER TABLE questions ALTER COLUMN tags SET NOT NULL;
```

#### Never do this in production:
```sql
-- ❌ Drops all data
DROP TABLE questions;

-- ❌ Blocks table during full table rewrite (use concurrent index instead)
ALTER TABLE questions ADD COLUMN new_col TEXT NOT NULL DEFAULT 'x';

-- ✅ Safe alternative
ALTER TABLE questions ADD COLUMN IF NOT EXISTS new_col TEXT;
UPDATE questions SET new_col = 'x' WHERE new_col IS NULL;
```

### Data Protection

#### PostgreSQL Backup

```sh
# Automated daily backup to S3 (example cron)
pg_dump -U postgres mathquiz | gzip | \
  aws s3 cp - s3://your-bucket/backups/mathquiz-$(date +%Y%m%d).sql.gz

# Restore from backup
aws s3 cp s3://your-bucket/backups/mathquiz-20240115.sql.gz - | \
  gunzip | psql -U postgres mathquiz
```

#### Docker Volume Persistence

```sh
# Backup the postgres volume
docker run --rm \
  -v devops_ai_multiagent_terraform_course_project_postgres_data:/data \
  -v $(pwd):/backup alpine \
  tar czf /backup/postgres-backup.tar.gz /data

# Restore
docker run --rm \
  -v devops_ai_multiagent_terraform_course_project_postgres_data:/data \
  -v $(pwd):/backup alpine \
  tar xzf /backup/postgres-backup.tar.gz -C /
```

### Production Environment Variables

```sh
# Generate a strong JWT secret
openssl rand -base64 32

# Production docker-compose.prod.yml additions
environment:
  JWT_SECRET:        <32-char random string>
  ADMIN_EMAIL:       yourname@yourdomain.com
  ADMIN_PASSWORD:    <strong password>
  DATABASE_URL:      postgresql://user:pass@rds-endpoint:5432/mathquiz?sslmode=require
  REDIS_URL:         rediss://user:pass@elasticache-endpoint:6380
  FRONTEND_URL:      https://yourdomain.com
  NODE_ENV:          production
```

### Production Health Checks

```sh
# All containers healthy
docker compose ps

# Database connection
curl http://localhost:3001/api/topics

# Auth working
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mathquiz.com","password":"Admin@123"}'

# Question count
docker exec <postgres> psql -U postgres -d mathquiz \
  -c "SELECT COUNT(*) FROM questions;"
# Expected: 150

# Active quiz sessions in Redis
docker exec <redis> redis-cli keys "session:*" | wc -l
```

### Rollback Procedure

```sh
# Tag images before every deploy
docker tag ghcr.io/sandeshlamsal/quiz-backend:latest \
           ghcr.io/sandeshlamsal/quiz-backend:v1.2.0

# If new deploy fails → rollback in 30 seconds
docker service update \
  --image ghcr.io/sandeshlamsal/quiz-backend:v1.1.0 \
  quiz_backend
```

---

## Security Notes (Production Checklist)

- [ ] Set `JWT_SECRET` to a strong random string (`openssl rand -base64 32`)
- [ ] Change `ADMIN_EMAIL` and `ADMIN_PASSWORD` from defaults
- [ ] Use secrets manager (AWS Secrets Manager / Vault) for DB credentials
- [ ] Enable HTTPS — TLS at load balancer or nginx with Let's Encrypt
- [ ] Set `FRONTEND_URL` to actual production domain for CORS
- [ ] Enable PostgreSQL SSL (`?sslmode=require` in connection string)
- [ ] Set Redis `requirepass` and use `rediss://` (TLS) in production
- [ ] Set `NODE_ENV=production` (disables stack traces in error responses)
- [ ] Rate limit `/api/auth/login` endpoint (prevent brute force)
- [ ] Rotate JWT secret periodically and invalidate old sessions

- [ ] Set `JWT_SECRET` to a strong random string (min 32 chars)
- [ ] Change `ADMIN_EMAIL` and `ADMIN_PASSWORD` from defaults
- [ ] Use `POSTGRES_PASSWORD` from a secrets manager, not hardcoded
- [ ] Run behind HTTPS (add TLS to nginx or use a reverse proxy like Traefik)
- [ ] Set `FRONTEND_URL` to the actual production domain for CORS
- [ ] Enable Postgres connection SSL
- [ ] Set Redis `requirepass` in production
