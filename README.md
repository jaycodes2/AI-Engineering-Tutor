# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create `.env.local` in the project root with:

   ```
   GEMINI_API_KEY=your_gemini_api_key
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

3. In Firebase Console, enable Authentication providers:
   - Email/Password
   - Google
   - Apple (requires Apple configuration in Firebase Console)

4. Run the app:
   `npm run dev`

### Auth Notes

- Email/password supports both login and signup on the `Login` page.
- Google and Apple buttons use Firebase popup sign-in.
- Sign out via the avatar dropdown in the top-right.
