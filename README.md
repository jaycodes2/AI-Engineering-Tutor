## AI Engineering Tutor

An interactive AI-powered learning app to explore engineering topics through chat, lessons, and quizzes. It features user authentication, persistent chat sessions, and a clean, responsive UI.

### Features
- **AI Tutor Chat**: Ask questions, get explanations, and suggested follow-up topics.
- **Lessons & Quizzes**: Topic-based lesson generation with a multiple-choice quiz.
- **Auth**: Email/password signup and login, plus Google and Apple sign-in.
- **Persistent Chat History**: Per-user chat sessions saved to `localStorage` and restored on reload.
- **Clean UI**: Modern design with theme controls and performance dashboard.

### Tech Stack
- **Frontend**: React 19, Vite 6
- **UI**: Tailwind CSS (CDN in `index.html`), custom components in `components/ui`
- **Charts**: `recharts`
- **AI**: `@google/genai`
- **Auth**: Firebase Authentication (Email/Password, Google, Apple)
- **Persistence**: `localStorage` for chat sessions (per user)

## Project Structure
```
ai-engineering-tutor/
  App.jsx
  index.html
  index.tsx
  components/
    LoginPage.jsx
    ChatPage.jsx
    ChatInterface.jsx
    DashboardPage.jsx
    PerformancePage.jsx
    ProfilePage.jsx
    Header.jsx
    ui/ (Button, Card, Input, Label, etc.)
  services/
    geminiService.js
    auth.js
    localChatStore.js
  constants.js
  styles.css
  vite.config.ts
```

## Getting Started

### Prerequisites
- Node.js 18+

### Install
```bash
npm install
```

### Environment Variables
Create `.env.local` in the project root:
```bash
# AI (client-side for now). For production, move to a serverless API.
VITE_GEMINI_API_KEY=your_gemini_api_key

# Firebase Auth
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### Firebase Authentication Setup
1. Go to Firebase Console → Authentication → Get Started
2. Enable providers:
   - Email/Password
   - Google (add authorized domains as needed)
   - Apple (requires Apple Service ID, Team ID, Key ID, and redirect URLs)
3. Add your local and deployment domains to Firebase Authorized Domains.

### Run Locally
```bash
npm run dev
```
Open the printed URL (typically `http://localhost:5173`).

### Build
```bash
npm run build
npm run preview
```

## Deployment (Vercel)
1. Push the repository to GitHub/GitLab/Bitbucket
2. In Vercel → New Project → Import the repo
3. Framework Preset: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Set Environment Variables in Vercel → Settings → Environment Variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_GEMINI_API_KEY` (temporary if used client-side)

### Important: Secure the AI key
- For production, move Gemini calls into a Vercel Serverless Function and use `process.env.GEMINI_API_KEY` on the server. Update the app to call the API route instead of using the key in the client.

## Notes & Limitations
- Chat history is stored in `localStorage` per user email. Clearing browser storage will remove the history.
- Apple Sign-in requires proper configuration in Firebase and Apple Developer settings.
- If you introduce route-based navigation later, configure Vercel rewrites to serve `index.html` for SPA routes.

## Roadmap (suggested)
- Move AI calls to a secure serverless API.
- Optional: Replace `localStorage` with a database (e.g., Firebase Firestore or MongoDB).
- Add path-based routing and session management UI (create/rename/delete sessions).
- Tests and CI.

## Scripts
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`

## License
MIT (or update as needed)

## Author
[Your Name]
