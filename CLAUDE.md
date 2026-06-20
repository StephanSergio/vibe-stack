# CLAUDE.md

Guidance for Claude Code working in a vibe-stack app.

## What this is
A starter for **GitHub Pages + Firebase + Claude AI** apps: Vite + React 19 + TS,
Firestore for data, Claude for AI (via a server-side proxy), deployed to Pages by
GitHub Actions. See `AGENTS.md` for the agent/skill layer and
`docs/ARCHITECTURE.md` for how the pieces fit.

## Golden rules
- **Use the skills.** `design` for UI, `integration` for Firebase/Claude/deploy,
  `scaffold-app` to start a new app, `claude-feature` for AI work.
- **Plan non-trivial work** with the `app-architect` agent before editing.
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
