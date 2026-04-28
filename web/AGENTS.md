# AGENTS.md

## Project: Квесты

### Overview
Квесты — веб-приложение для создания и прохождения городских квестов с геолокацией. Пользователи создают квесты с чекпоинтами на карте, проходят квесты в одиночку или командами, получают очки и участвуют в рейтинге.

Система включает модерацию контента для обеспечения безопасности.

---

## Tech Stack (expected)
- Frontend: Next.js (App Router), TypeScript, Tailwind
- Backend: FastAPI / Node.js (REST API)
- Database: PostgreSQL (+ PostGIS optional)
- Auth: JWT + cookies
- Maps: Yandex Maps or 2GIS API
- File storage: local storage (MVP)

---

## Core Entities

### User
- id
- email
- password_hash
- nickname
- age_group (14–15 / 16–17)
- role (user / moderator)

### Team
- id
- name
- description
- invite_code
- members[]

### Quest
- id
- title
- description
- location (city/region)
- cover_image
- difficulty (1–5)
- duration_estimate
- status:
  draft → moderation → published → rejected → archived
- author_id

### Checkpoint
- id
- quest_id
- name
- description
- coordinates (lat, lng)
- task_type:
  - code_word
  - multiple_choice
  - (optional: hybrid)
- correct_answer
- options (if MCQ)
- hint (optional)

### QuestSession
- id
- quest_id
- user_id or team_id
- status: started / in_progress / finished / abandoned
- current_checkpoint_index
- start_time
- end_time
- score

---

## Key Flows

### 1. Quest Creation
User creates quest → adds 3+ checkpoints → status = draft → submits for moderation.

### 2. Moderation
Moderator:
- approves quest → published
- rejects quest with reason
- can hide unsafe content

Demo moderator:
- moderator / demo123

---

### 3. Quest Execution
- user/team starts session
- checkpoints unlock sequentially
- validation:
  - code_word → string compare (case-insensitive)
  - multiple_choice → option match
- progress tracked as N/M checkpoints

---

### 4. Scoring System
- points per checkpoint
- bonus for completing quest
- optional speed bonus
- anti-abuse:
  - 1 quest completion per 24h per team/user

---

### 5. Leaderboard
- ranked by total score
- team-based ranking
- filters: all-time

---

## Geo Logic
- quests stored with coordinates
- “nearby quests” calculated via:
  - PostGIS OR Haversine formula
- map clustering required for markers

---

## Roles
- user: create, join, play quests
- moderator: approve/reject quests, handle reports

---

## Non-functional requirements
- mobile-first UI
- fast quest browsing (pagination)
- safe content moderation layer
- validation on backend (never trust frontend)

---

## Important Rules
- no CMS usage (WordPress etc.)
- each quest must have ≥ 3 checkpoints
- author cannot play own quest in team
- secure auth required for all mutations

---

## Notes for Agents
- prefer simple MVP logic over overengineering
- keep geo calculations server-side if possible
- avoid complex realtime unless explicitly needed
- prioritize demo stability over perfect architecture