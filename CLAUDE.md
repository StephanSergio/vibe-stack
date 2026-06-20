# CLAUDE.md

Guidance for Claude Code working in a vibe-stack app.

## What this is
A starter for **GitHub Pages + Firebase + Claude AI** apps: Vite + React 19 + TS,
Firestore for data, Claude for AI (via a server-side proxy), deployed to Pages by
GitHub Actions. See `AGENTS.md` for the agent/skill layer and
`docs/ARCHITECTURE.md` for how the pieces fit.

## Golden rules
- **Use the skills.** `product-owner` to scope, `ux-designer` for flows, `design`
  for UI, `integration` for Firebase/Claude/deploy, `scaffold-app` to start a new
  app, `claude-feature` for AI work, `test-automation` for tests, `ops-monitor`
  for pipeline/Pages health.
- **Run the chain for features:** `product-owner` → `ux-designer` →
  `app-architect` → build agents → `qa-engineer`. Skip straight to a build agent
  for trivial tweaks. See `AGENTS.md`.
- **Route by `.claude/context/routing.md`** — it maps an intent or a failure
  signal to the agent + skill to spin up. Check `npm run status` for deploy health.
- **Read `.claude/context/account-repos.md`** before building — reuse patterns
  from `mercato` (open/collab) or `CleanFit` (auth) instead of reinventing.
- **Tokens-only CSS**, mobile-first, one accent color.
- **`COLLECTIONS` map** for Firestore names; one realtime hook per collection.
- **Claude key stays server-side** via the proxy; the direct browser key is
  public — only for throwaway use.
- **`base` in `vite.config.ts` must equal `/<repo>/`** or the Pages deploy is blank.
- Secrets live as GitHub Actions secrets, never in the repo.

## Verify before done
```
npm run typecheck && npm run lint && npm run build
```

## Layout
```
src/firebase.ts        Firebase init + COLLECTIONS
src/lib/claude.ts      askClaude / askClaudeForJson (proxy or direct)
src/hooks/             one onSnapshot hook per collection
src/styles/globals.css design tokens
functions/index.js     Claude proxy (key server-side)
firestore.rules        security posture (open OR auth-guarded)
.github/workflows/     Pages deploy
.claude/               agents, skills, shared context
```
