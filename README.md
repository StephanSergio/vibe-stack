# ⚡ vibe-stack

A starter for building **GitHub Pages + Firebase + Claude AI** apps — fast.

Vite + React 19 + TypeScript on the front, Firestore for realtime data, the
Claude API for AI features (key kept server-side via a Firebase Function), and a
GitHub Actions workflow that deploys to Pages on every push to `main`. It ships
with a **Claude Code agent layer** (agents + skills) so an AI can build on the
stack consistently.

> Distilled from real apps on this stack — see
> [`mercato`](https://github.com/StephanSergio/mercato) (collaborative, no-auth)
> and [`CleanFit`](https://github.com/StephanSergio/CleanFit) (auth-guarded).

## What's inside

```
src/firebase.ts          Firebase init + COLLECTIONS map
src/lib/claude.ts        askClaude() / askClaudeForJson() — proxy or direct
src/App.tsx              minimal landing screen (status + "ping Claude")
src/styles/globals.css   Nordic-minimal design tokens
functions/index.js       generic Claude proxy (keeps the API key server-side)
firestore.rules          two security postures — pick one
.github/workflows/       GitHub Pages deploy
docs/ARCHITECTURE.md     how the pieces fit + trade-offs
AGENTS.md                the agent/skill layer
.claude/
  skills/                product-owner · ux-designer · design · integration ·
                         scaffold-app · claude-feature · test-automation
  agents/                product-owner · ux-designer · app-architect ·
                         firebase-integrator · ui-designer ·
                         claude-feature-builder · qa-engineer
  context/account-repos.md   shared context on the account's apps
```

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in Firebase + (optional) Claude
npm run dev
```

Open the dev URL — the landing screen shows whether Firebase and Claude are
configured, with a button to ping Claude.

## Make it your app

Follow the **`scaffold-app`** skill. The short version:

1. Rename in `package.json`, `index.html`, and set `base: '/<repo>/'` in
   `vite.config.ts`.
2. Create a Firebase project; paste the web config into `.env.local`; create
   Firestore and publish a posture from `firestore.rules`.
3. (Optional) deploy the Claude proxy and set `VITE_CLAUDE_PROXY_URL`, or set a
   public `VITE_ANTHROPIC_API_KEY` for throwaway use.
4. Build your screens (`design` skill) and AI features (`claude-feature` skill).
5. Add `VITE_*` as GitHub Actions secrets, set Pages source to **GitHub Actions**,
   push to `main`.

## Building with Claude Code

This repo is set up to be built *by* an agent. The flow:

1. **Define** with `product-owner` (stories → acceptance criteria → MVP).
2. **Shape** with `ux-designer` (flows → navigation → interaction states).
3. **Plan** with `app-architect` (data model → screens → AI → build order).
4. **Implement** with `firebase-integrator`, `ui-designer`, `claude-feature-builder`.
5. **Test** with `qa-engineer`; **verify** — `npm run typecheck && npm run lint && npm run test && npm run build`.
6. **Ship** — push to `main`.

Agents read `.claude/context/account-repos.md` to reuse patterns across the
portfolio. See `AGENTS.md`.

## The stack at a glance

| Layer   | Choice                       | Why |
|---------|------------------------------|-----|
| UI      | Vite + React 19 + TS         | fast dev, static output |
| Data    | Firestore (`onSnapshot`)     | realtime, collaborative, no server |
| AI      | Claude via Function proxy    | key stays server-side |
| Hosting | GitHub Pages + Actions       | free, push-to-deploy |
| Design  | Nordic-minimal, tokens       | one cohesive look (`design` skill) |

## Security notes
- The public Firebase config is meant to be public — your safety is in
  `firestore.rules`. Pick **open** only for trusted private apps; otherwise go
  **auth-guarded**.
- Prefer the Claude **proxy**. A direct browser key ships in the bundle and is
  visible to everyone.
- Keep every secret in GitHub Actions secrets / function secrets — never commit
  `.env.local`.

## Scripts
```
npm run dev        # local dev server
npm run build      # typecheck + production build
npm run typecheck  # tsc -b
npm run lint       # eslint
npm run preview    # preview the production build
```

---
🤖 Scaffolded with [Claude Code](https://claude.com/claude-code)
