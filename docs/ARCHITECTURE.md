# Architecture

vibe-stack is a **static frontend + serverless edges** architecture chosen so a
whole app can run with zero servers to operate and a near-zero hosting bill.

```
   Browser (GitHub Pages, static)
   ┌──────────────────────────────────────────────┐
   │  React + Vite SPA                              │
   │   ├─ src/firebase.ts   ── Firestore SDK ───────┼──►  Firestore (realtime DB)
   │   │     onSnapshot hooks (live read/write)     │      + optional Firebase Auth
   │   │                                            │
   │   └─ src/lib/claude.ts ── fetch ───────────────┼──►  Claude proxy (Cloud Function)
   │         (proxy URL, or direct w/ public key)   │      └─ ANTHROPIC_API_KEY (secret)
   └──────────────────────────────────────────────┘            │
                                                                └──►  Anthropic API
   Build/deploy: push main ─► GitHub Actions ─► build dist/ ─► Pages
```

## Pieces

- **Frontend** — Vite + React 19 + TS, hosted statically on GitHub Pages. No
  server to run. `base` in `vite.config.ts` must equal the repo path.
- **Data — Firestore.** The browser talks to Firestore directly via the SDK.
  Realtime `onSnapshot` hooks give collaborative, live-updating state for free.
  Security is enforced by **rules**, not by a backend (there isn't one).
- **AI — Claude.** Two paths:
  - *Proxy (default):* a Firebase **Cloud Function** holds the API key as a secret
    and forwards requests. The browser never sees the key.
  - *Direct:* the browser calls Anthropic with a public key — only acceptable for
    throwaway/tightly-limited keys.
- **Deploy — GitHub Actions.** On push to `main`: install, build with `VITE_*`
  secrets injected, publish `dist/` to Pages.

## Why this shape
- **No ops:** static hosting + managed Firestore + a single function. Nothing to
  patch or scale manually.
- **Cheap:** Pages is free; Firestore + Functions sit in generous free tiers for
  personal/family apps.
- **Real-time + collaborative** out of the box via Firestore listeners.
- **Secrets stay safe** as long as you use the proxy and keep keys in Actions
  secrets / function secrets — never in the bundle or the repo.

## The two security postures
- **Open (no auth):** Firestore rules allow read/write; the app is shared only
  with trusted people who have the URL. Simple; used by `mercato`. *Anyone with
  the public config can write — only for private/family use.*
- **Auth-guarded:** Firebase Auth + rules requiring `request.auth`, ideally with
  per-user ownership. Used by `CleanFit`. Choose this for anything with accounts
  or non-trivially private data.

## Trade-offs to know
- No private server-side logic except what you put in functions — heavy/secret
  compute belongs in a Cloud Function, not the SPA.
- The public Firebase config is, by design, public; your safety is the rules.
- Pages is a single static origin — set the function's CORS `ALLOWED_ORIGINS`
  accordingly.
