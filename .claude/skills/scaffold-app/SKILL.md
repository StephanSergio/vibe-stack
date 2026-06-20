---
name: scaffold-app
description: Spin up a brand-new app from the vibe-stack starter — rename, point at a Firebase project, set the Pages base path, wire secrets, and ship a first deploy. Use when starting a new GitHub Pages + Firebase + Claude app.
---

# Scaffold a new app

Turn this starter into a named, deployable app. Do these in order.

## 1. Name & rebrand
- `package.json` → `name`, `description`.
- `vite.config.ts` → `base: '/<repo-name>/'` (must match the GitHub repo name).
- `index.html` → `<title>`, `<meta name="description">`, `lang`.
- `public/favicon.svg` → swap the glyph/color if desired.

## 2. Firebase project
- Create a project at console.firebase.google.com → add a **Web app** → copy the
  SDK config into `.env.local` (`VITE_FIREBASE_*`). See `.env.example`.
- Create **Firestore** (production mode). Pick a security posture in
  `firestore.rules` (see the `integration` skill) and publish it.
- If the app needs accounts, enable **Authentication** providers (e.g. Google).

## 3. Claude (optional but expected)
- Recommended: deploy the proxy — `firebase functions:secrets:set ANTHROPIC_API_KEY`
  then `firebase deploy --only functions`; put the function URL in
  `VITE_CLAUDE_PROXY_URL`. Add your Pages domain to `ALLOWED_ORIGINS`.
- Quick/throwaway: set `VITE_ANTHROPIC_API_KEY` directly (key is public — beware).

## 4. Model the data
- Add collection names to `COLLECTIONS` in `src/firebase.ts`.
- Add a realtime hook per collection in `src/hooks/` (onSnapshot pattern).
- Add domain types in `src/types.ts`.

## 5. Build the UI
- Replace `src/App.tsx`. Follow the `design` skill. Mobile-first, bottom nav if
  there are multiple screens.

## 6. Ship
- Create the GitHub repo (public unless it holds secrets — it shouldn't).
- Add every `VITE_*` value as an Actions secret (Settings → Secrets → Actions).
- Settings → Pages → Source = **GitHub Actions**.
- Push to `main`; the deploy workflow publishes to
  `https://<user>.github.io/<repo>/`.

## Verify
- `npm run typecheck && npm run lint && npm run build` all clean.
- Local `npm run dev` shows Firebase + Claude as configured.
- After deploy, the live URL loads (not blank → `base` is correct).
