# AI Engineering Tutor — FastAPI Backend

A production-ready FastAPI backend for LLM orchestration, prompt validation, and learning analytics. The frontend never touches the Gemini API key — all AI calls go through this service.

---

## Architecture

```
frontend (React/Vite)
    │
    │  Firebase ID token in Authorization header
    ▼
FastAPI backend
    ├── PromptValidationMiddleware  → blocks injection, oversized inputs
    ├── FirebaseAuth dependency     → verifies every request
    ├── /api/chat
    │     ├── POST /message         → LLM chat (Cognite tutor)
    │     └── POST /title           → title + topic suggestions
    ├── /api/lessons
    │     ├── POST /generate        → lesson + quiz generation
    │     ├── POST /image           → Imagen image generation
    │     └── POST /quiz/submit     → quiz answer + AI feedback
    └── /api/analytics
          ├── POST /event           → record learning event
          ├── GET  /stats           → aggregated user stats
          └── GET  /events          → raw event list
    │
    ▼
Google Gemini 2.5 Flash / Imagen 3
```

---

## Folder Structure

```
backend/
  main.py                     ← FastAPI app + middleware + routers
  requirements.txt
  .env.example
  core/
    config.py                 ← pydantic-settings (reads .env)
    firebase_auth.py          ← Firebase ID token verification dependency
  models/
    schemas.py                ← all Pydantic request/response models
  services/
    llm_service.py            ← all Gemini API calls (chat, lesson, image, feedback)
    analytics_service.py      ← in-memory analytics store
  middleware/
    prompt_validator.py       ← injection detection + length guard
  routers/
    chat.py
    lessons.py
    analytics.py
```

---

## Setup

### 1. Prerequisites

- Python 3.11+
- A Google Cloud project with Gemini API enabled
- A Firebase project with Authentication enabled

### 2. Install dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id

# Path to your Firebase service account JSON (download from Firebase Console)
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json
```

**Getting a service account:**
1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save as `backend/serviceAccount.json` (never commit this file)

### 4. Run locally

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: http://localhost:8000/docs

---

## Frontend Integration

Replace `services/geminiService.js` with `geminiService.updated.js` (provided in this repo).

Add to your frontend `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

For production (Vercel):
```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

---

## Deployment

### Option A: Railway / Render (recommended for FastAPI)

1. Push `backend/` to a separate repo or use a monorepo
2. Set environment variables in the platform dashboard
3. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Option B: Vercel Serverless (via adapter)

Not recommended for streaming — use Railway/Render instead.

### Option C: Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Security Notes

- **Gemini API key** lives only in backend env — never in the browser
- **Every endpoint** requires a valid Firebase ID token
- **Prompt validation middleware** blocks injection patterns and oversized inputs
- **History trimming** — only last 20 turns sent to Gemini (controls token cost)
- Move analytics to **Firestore** for production (current in-memory store resets on restart)

---

## Roadmap

- [ ] Firestore-backed analytics (replace in-memory store)
- [ ] Rate limiting per user (slowapi)
- [ ] Streaming chat responses (Server-Sent Events)
- [ ] Adaptive difficulty — auto-adjust based on quiz accuracy
