# Dispatch routing

How the project decides **which agent to spin up, with which skill**, for a given
task or failure. The `release-monitor` agent (and you) consult this table; the
agents live in `.claude/agents/`, the skills in `.claude/skills/`.

## By intent (building something)

| The request is about… | Spin up | With skill |
|------------------------|---------|------------|
| What to build / scope / priorities / "is this worth it" | `product-owner` | `product-owner` |
| How it should flow / screens / navigation / accessibility | `ux-designer` | `ux-designer` |
| Overall plan / data model / build order (non-trivial feature) | `app-architect` | — |
| Visual styling, components, layout, polish | `ui-designer` | `design` |
| Firestore data, realtime hooks, security rules, auth | `firebase-integrator` | `integration` |
| A Claude/AI feature (prompt, call, proxy, AI UI states) | `claude-feature-builder` | `claude-feature` |
| Tests, coverage, a CI test gate | `qa-engineer` | `test-automation` |
| Starting a brand-new app from the starter | `app-architect` then build agents | `scaffold-app` |
| Deploy health, red pipeline, broken Pages | `release-monitor` | `ops-monitor` |

## By failure signal (something broke — from `npm run status` / run logs)

| Signal in logs / status | Likely cause | Route to | Skill |
|--------------------------|--------------|----------|-------|
| `deploy-pages … Not Found` / 404 creating deployment | Pages not enabled | *(human/ops)* enable Pages → Actions | `ops-monitor` |
| Deployed site is blank / assets 404 | Wrong `base` in `vite.config.ts` | `ui-designer` | `design` |
| `tsc` / type errors in build | Type/contract break | the agent that owns the file | `integration`/`design`/`claude-feature` |
| `eslint` errors | Lint break | same build agent | (matching skill) |
| Test job red | Failing/missing tests | `qa-engineer` | `test-automation` |
| `VITE_* is undefined` / build can't find config | Missing Actions secret | *(human/ops)* add secret | `integration` |
| CORS error hitting the proxy | Origin not allowlisted | `firebase-integrator` | `integration` |
| `permission-denied` writing Firestore | Rules deny it | `firebase-integrator` | `integration` |
| `auth/...` errors | Auth provider/config | `firebase-integrator` | `integration` |
| Claude 4xx / malformed output | Prompt/parse/model issue | `claude-feature-builder` | `claude-feature` |

## Rules of dispatch

- **Scale to the task.** Trivial mechanical fix → go straight to the one build
  agent. New feature → run the chain `product-owner → ux-designer → app-architect
  → build agents → qa-engineer` (see `AGENTS.md`).
- **Plan-only agents don't edit.** `product-owner`, `ux-designer`, `app-architect`
  produce specs/plans; hand their output to the build agents.
- **Parallelize independent slices**, but respect the order
  types → data → hooks → UI → wiring.
- **Always verify** after a fix: `npm run typecheck && npm run lint &&
  npm run test && npm run build`, then `npm run status` until green.
- **Some fixes aren't code** (enable Pages, add a secret) — the table flags those
  as ops/human steps, not an agent to spin up.
