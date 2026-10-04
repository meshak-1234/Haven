# Haven — AI Companion

Haven is a calm, grounded AI companion designed to communicate naturally with people, provide empathetic conversations, and offer supportive guidance. It features full user authentication, per-user conversation and memory storage, and a responsible safety layer that surfaces verified crisis resources.

> **Important:** Haven is an AI companion for emotional reflection, **not** a medical provider, therapist, or emergency service. If you are in crisis, please reach out to the [988 Suicide & Crisis Lifeline](https://988lifeline.org) or text HOME to 741741.

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React 19, TypeScript, Vite 8, Vanilla CSS |
| Backend | Python 3.12, FastAPI, Uvicorn |
| ORM | SQLAlchemy 2.0 |
| Database | SQLite (default) or MySQL / PostgreSQL via pymysql / psycopg2 |
| AI Provider | Google Gemini 1.5 Flash (configurable; offline mock available) |
| Auth | JWT bearer tokens (PyJWT + bcrypt) |
| Icons | Lucide React |

---

## Project Structure

```
Haven/
├── .env                  # Local environment variables (never commit)
├── .env.example          # Configuration template
├── .gitignore
├── README.md
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── core/         # config.py, security.py
│       ├── db/           # database.py, models.py
│       ├── api/          # deps.py, endpoints/
│       ├── schemas/
│       └── services/     # chat, memory, safety, AI providers
└── frontend/
    ├── index.html
    ├── package.json
    └── src/
        ├── App.tsx
        ├── index.css
        ├── context/      # AuthContext.tsx
        ├── services/     # api.ts
        ├── types/
        └── components/   # Navbar, Sidebar, ChatArea, AuthModal, etc.
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

### AI Provider

```env
AI_PROVIDER=gemini          # 'gemini' or 'mock' (no API key needed for mock)
GEMINI_API_KEY=             # Your Google AI Studio API key
GEMINI_MODEL=gemini-1.5-flash
```

### Database — Option A: Discrete Variables (Recommended for external SQL)

```env
DB_TYPE=mysql               # sqlite | mysql | postgresql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=haven
DB_USER=your_username
DB_PASSWORD=your_password
DATABASE_URL=               # Leave empty when using Option A
```

### Database — Option B: Direct Connection URL

```env
DATABASE_URL=mysql+pymysql://username:password@127.0.0.1:3306/haven
# or for PostgreSQL:
# DATABASE_URL=postgresql+psycopg2://username:password@127.0.0.1:5432/haven
# or SQLite (zero config, default for local dev):
# DATABASE_URL=sqlite:///./haven.db
```

### Auth & Server

```env
JWT_SECRET=replace-with-a-secure-random-secret-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

BACKEND_HOST=127.0.0.1
BACKEND_PORT=8000
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]
```

---

## Setup & Running

### 1. Backend Setup

```powershell
# Install Python dependencies
pip install -r backend/requirements.txt

# Verify database connection & initialize tables (non-destructive)
python backend/tests/test_db_connection.py

# Start the backend server
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

The FastAPI interactive docs will be available at: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

The frontend will be available at: `http://localhost:5173`

---

## Database Setup

### MySQL

```sql
CREATE DATABASE haven CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then set `DB_TYPE=mysql` and your credentials in `.env`.  
Haven uses SQLAlchemy with `pymysql` so no extra drivers are needed beyond:

```powershell
pip install pymysql cryptography
```

### SQLite (Zero-config for local development)

The default `.env` uses SQLite — no server required. The file `haven.db` is created automatically on first run.

---

## Authentication Architecture

```
User Input
    |
    v
Frontend (React + AuthContext)
    |   POST /api/auth/register  (email, password, name)
    |   POST /api/auth/login     (email, password)
    v
FastAPI Backend
    |   bcrypt password hash / verify
    |   JWT bearer token (signed with JWT_SECRET)
    v
SQL Database (users table)
    |
    v
Token stored in localStorage ('haven_token')
All subsequent API calls include: Authorization: Bearer <token>
```

**User isolation:** Every database table that holds user content (`conversations`, `messages`, `memories`, `user_settings`) has a foreign key to `users.id`. All queries are filtered by the authenticated user's ID — User A can never read User B's data.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register new account |
| POST | `/api/auth/login` | No | Login, receive JWT |
| GET | `/api/users/me` | Yes | Get profile & settings |
| PUT | `/api/users/me` | Yes | Update profile |
| GET | `/api/users/me/settings` | Yes | Get companion preferences |
| PUT | `/api/users/me/settings` | Yes | Update companion preferences |
| DELETE | `/api/users/me` | Yes | Delete account and all data |
| POST | `/api/chat` | Yes | Send message, receive AI response |
| GET | `/api/conversations` | Yes | List user conversations |
| POST | `/api/conversations` | Yes | Create new conversation |
| GET | `/api/conversations/{id}` | Yes | Get conversation with messages |
| DELETE | `/api/conversations/{id}` | Yes | Delete conversation |
| DELETE | `/api/conversations/{id}/messages` | Yes | Clear messages |
| GET | `/api/memory` | Yes | List user memories |
| POST | `/api/memory` | Yes | Add memory |
| PUT | `/api/memory/{id}` | Yes | Update memory |
| DELETE | `/api/memory/{id}` | Yes | Delete memory |
| DELETE | `/api/memory` | Yes | Clear all memories |
| GET | `/api/safety/resources` | No | Public crisis helplines |

---

## Registration & Login Flow

**New User:**
1. Visit Haven → click "Begin Reflection"
2. "Join Haven" tab → enter name, email, password
3. Backend: validates → hashes password (bcrypt) → stores in `users` table → creates default settings → issues JWT
4. Token stored in `localStorage` → main chat interface opens

**Existing User:**
1. Visit Haven → click "Begin Reflection"
2. "Sign In" tab → enter email, password
3. Backend: finds user by email → `bcrypt.checkpw()` → issues JWT
4. Token stored in `localStorage` → main chat interface opens

---

## Running Backend Tests

```powershell
# Full integration test (registration, login, chat, safety, memory, conversations)
python backend/tests/test_api.py

# Database connectivity diagnostic
python backend/tests/test_db_connection.py
```

---

## Security Notes

- Passwords are **never** stored in plain text — bcrypt with random salts is used
- JWT secrets and database credentials must remain **server-side** and **never** committed
- The `.gitignore` excludes `.env`, `*.db`, `__pycache__`, `node_modules`, and `dist`
- The frontend only stores a JWT token; database credentials are never exposed to the browser
- All user-specific endpoints validate the authenticated user and filter all queries by `user_id`
