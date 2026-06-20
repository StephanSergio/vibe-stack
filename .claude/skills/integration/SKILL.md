---
name: integration
description: Wire up the vibe-stack integrations — Firebase (Firestore + optional Auth), the Claude API proxy, and GitHub Pages deploy. Use when adding data persistence, AI features, secrets, or fixing deploy/CORS/env issues.
---

# Integration

How the three pillars of a vibe-stack app fit together and the rules for wiring
them safely.

## 1. Firebase (Firestore)

- Init lives in `src/firebase.ts` (reads `VITE_FIREBASE_*` env vars). All
  collection names go in the exported `COLLECTIONS` map — never inline strings.
- **Realtime hooks pattern:** one hook per collection in `src/hooks/`, using
  `onSnapshot` for live updates and `addDoc` / `updateDoc` / `deleteDoc` for
  writes. Denormalize fields you render often. Use `serverTimestamp()` for
  ordering. (See `mercato`'s `useShoppingList` for the canonical shape.)
- **Security posture** (`firestore.rules`): pick per collection —
  - *Open (no auth)*: only for a private app shared with trusted people. The
    public Firebase config can read/write; security lives in the rules.
  - *Auth-guarded*: `request.auth != null`, ideally with per-user ownership
    (`request.auth.uid == resource.data.ownerId`). Pair with Firebase Auth.
  - **Always** end with a catch-all `match /{document=**} { allow ...: if false }`.
- Publish rules from the Firebase console (Firestore → Rules) or
  `firebase deploy --only firestore:rules`.

## 2. Claude API

- Client helper: `src/lib/claude.ts` → `askClaude()` / `askClaudeForJson()`.
- **Two modes, controlled by env:**
  - **Proxy (recommended):** set `VITE_CLAUDE_PROXY_URL` to your deployed
    Cloud Function. The key stays server-side (`functions/index.js`,
    `firebase functions:secrets:set ANTHROPIC_API_KEY`). Add your Pages domain
    to `ALLOWED_ORIGINS` in the function.
  - **Direct browser call:** set `VITE_ANTHROPIC_API_KEY`. The key ships in the
    bundle and is publicly visible — only for throwaway/tightly-limited keys.
  - The proxy URL takes precedence when both are set.
- **Prompting for structured data:** ask for JSON only, then parse the first
  `{...}` block (`askClaudeForJson` does this). Models occasionally wrap JSON in
  prose — never assume the whole response is JSON.
- **Models:** default `claude-sonnet-4-6`. For the latest model ids/pricing,
  check the Anthropic docs rather than guessing.

## 3. GitHub Pages deploy

- `.github/workflows/deploy.yml` builds on push to `main` and publishes `dist/`.
- **`base` in `vite.config.ts` MUST equal `/<repo-name>/`** or assets 404 on
  Pages. This is the #1 deploy bug — check it first when a deployed site is blank.
- Secrets: add every `VITE_*` value under **Settings → Secrets and variables →
  Actions** (they are injected at build time only — never committed).
- Enable Pages with source = **GitHub Actions** (Settings → Pages).

## Common failure modes

- **Blank deployed page** → wrong `base` path, or missing build secrets.
- **CORS error calling the proxy** → origin not in the function's `ALLOWED_ORIGINS`.
- **`auth/...` errors** → Firebase Auth provider not enabled, or authDomain wrong.
- **Writes silently fail** → Firestore rules deny it; check the Rules tab logs.
- **Env var `undefined` in app** → not prefixed `VITE_`, or dev server not restarted.
