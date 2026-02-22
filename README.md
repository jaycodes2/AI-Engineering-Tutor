# 🧠 Cognite — AI Engineering Tutor

A full-stack AI-powered engineering tutor with real-time chat, personalized lessons, adaptive quizzes, and learning analytics. Built with React, FastAPI, and Groq's Llama 3.1.

**Live Demo:** [aiengineeringtutor.vercel.app](https://aiengineeringtutor.vercel.app)

---

## ✨ Features

### 💬 AI Chat Tutor
- Real-time **streaming responses** via Server-Sent Events — tokens appear as they're generated, just like ChatGPT
- Powered by **Groq's Llama 3.1** (14,400 free requests/day)
- Persistent chat history stored in **Firestore** — sessions survive page refreshes and logins
- Multiple chat sessions with auto-generated titles based on conversation context
- Suggested follow-up topics after each conversation
- Delete sessions with a hover-reveal button in the sidebar

### 📚 Learn (Dashboard)
- Choose from **12 engineering topics**: Thermodynamics, Circuit Analysis, Data Structures, Fluid Mechanics, Control Systems, Quantum Computing, Machine Learning, Signal Processing, Structural Analysis, Algorithms, Materials Science, Electromagnetics
- AI-generated lessons tailored to your selected difficulty level
- Each lesson includes a **4-option multiple choice quiz**
- Personalized topic suggestions based on your chat history
- Breadcrumb navigation with difficulty badge while viewing a lesson

### 📊 Performance Analytics
- **4 stat cards** showing: Messages Sent, Lessons Viewed, Quizzes Taken, Accuracy %
- **Topics Studied** section showing all topics you've explored
- **Bar chart** showing correct vs incorrect answers per topic (powered by Recharts)
- Adjustable difficulty: Beginner 🌱 / Intermediate 🌿 / Advanced 🌳
- Reset performance data at any time

### 🔐 Authentication & Persistence
- Firebase Authentication (Email/Password + Google Sign-In)
- Per-user chat sessions stored in **Firestore** under `users/{uid}/sessions/{sessionId}`
- Sessions auto-save with 1-second debounce after each message
- Sessions load on login sorted by most recent

### 🛡️ Backend Security
- **Firebase ID token verification** on every API endpoint
- **Rate limiting** via SlowAPI: 30 chat requests/min, 20 title requests/min per user
- **Prompt validation middleware** blocks injection patterns and oversized inputs (>8000 chars)
- API keys never exposed to the browser — all LLM calls go through the backend

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Vercel)                 │
│              React + Vite + Tailwind CSS             │
│                                                      │
│  ChatPage  │  DashboardPage  │  PerformancePage      │
│     ↓              ↓                  ↓              │
│         geminiService.js (API client)                │
│         firestoreService.js (Firestore)              │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS + Firebase Auth Token
┌──────────────────▼──────────────────────────────────┐
│                  Backend (Render)                    │
│                    FastAPI                           │
│                                                      │
│  Middleware: Auth → Rate Limit → Prompt Validation   │
│                                                      │
│  /api/chat/message    → Streaming SSE                │
│  /api/chat/title      → Title + topic suggestions    │
│  /api/lessons/generate → Lesson + quiz               │
│  /api/lessons/quiz/submit → Record answer            │
│  /api/analytics/stats  → User stats                  │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │    Groq API          │
        │  Llama 3.1-8b-instant│
        └─────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | FastAPI, Python 3.11 |
| LLM | Groq (Llama 3.1-8b-instant) |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| Charts | Recharts |
| Rate Limiting | SlowAPI |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Firebase project
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the repo

```bash
git clone https://github.com/jaycodes2/AI-Engineering-Tutor.git
cd AI-Engineering-Tutor
```

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:
```env
GROQ_API_KEY=your_groq_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
```

Place your Firebase service account JSON at `backend/serviceAccount.json`.

Start the backend:
```bash
uvicorn backend.main:app --reload
```

Backend runs at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:8000
```

Start the frontend:
```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## 🌐 Deployment

### Backend → Render

1. Connect your GitHub repo to [render.com](https://render.com)
2. Set build command: `pip install -r backend/requirements.txt`
3. Set start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:

| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | your Groq key |
| `FIREBASE_PROJECT_ID` | your project ID |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | minified JSON string of serviceAccount.json |
| `ALLOWED_ORIGINS_STR` | `https://your-app.vercel.app` |

### Frontend → Vercel

1. Import your repo at [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variables (same as local `.env` but with production backend URL)
4. After deploy, add your Vercel domain to Firebase Console → Authentication → Authorized Domains

---

## 📁 Project Structure

```
AI-Engineering-Tutor/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── requirements.txt
│   ├── core/
│   │   ├── config.py              # Settings (pydantic-settings)
│   │   └── firebase_auth.py       # Token verification dependency
│   ├── middleware/
│   │   ├── prompt_validator.py    # Injection + size checks
│   │   ├── rate_limiter.py        # SlowAPI rate limiting
│   │   └── uid_extractor.py       # Attach UID to request state
│   ├── models/
│   │   └── schemas.py             # Pydantic request/response models
│   ├── routers/
│   │   ├── chat.py                # Chat + streaming endpoints
│   │   ├── lessons.py             # Lesson + quiz endpoints
│   │   └── analytics.py          # Analytics endpoints
│   └── services/
│       ├── llm_service.py         # Groq API orchestration
│       └── analytics_service.py   # In-memory analytics store
└── frontend/
    ├── src/
    │   ├── App.jsx                # Root component + state
    │   ├── components/
    │   │   ├── ChatPage.jsx       # Chat UI with streaming
    │   │   ├── DashboardPage.jsx  # Learn page
    │   │   ├── PerformancePage.jsx# Stats + charts
    │   │   ├── TopicSelector.jsx  # Topic picker grid
    │   │   ├── LessonModule.jsx   # Lesson display
    │   │   └── Quiz.jsx           # Quiz component
    │   └── services/
    │       ├── geminiService.js   # Backend API client (SSE streaming)
    │       ├── firestoreService.js# Firestore chat persistence
    │       └── auth.js            # Firebase auth helpers
    └── public/
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat/message` | Stream chat response (SSE) |
| `POST` | `/api/chat/title` | Generate chat title + suggestions |
| `POST` | `/api/lessons/generate` | Generate lesson + quiz for topic |
| `POST` | `/api/lessons/quiz/submit` | Submit quiz answer + get feedback |
| `POST` | `/api/analytics/event` | Record a learning event |
| `GET` | `/api/analytics/stats` | Get user stats |
| `GET` | `/health` | Health check |

All endpoints (except `/health`) require a Firebase ID token in the `Authorization: Bearer <token>` header.

---

## 📈 Groq Free Tier Limits

| Model | Requests/min | Requests/day | Tokens/min |
|-------|-------------|-------------|-----------|
| llama-3.1-8b-instant | 30 | 14,400 | 131,072 |
| llama-3.3-70b-versatile | 30 | 14,400 | 6,000 |

Switch models by setting `GROQ_MODEL=llama-3.3-70b-versatile` in your `.env` for smarter responses.

---

## 🔒 Security Notes

- Never commit `serviceAccount.json` or `.env` to git
- Both are in `.gitignore` by default
- For production, pass `FIREBASE_SERVICE_ACCOUNT_JSON` as a minified JSON string in your hosting platform's environment variables

---

## 📄 License

MIT © 2026 Jay (jaycodes2)
