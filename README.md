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
scripts/                 status.mjs (CI + Pages monitor) · sync-repos.mjs ·
                         workspace.mjs (pull/branch/push related projects)
docs/ARCHITECTURE.md     how the pieces fit + trade-offs
AGENTS.md                the agent/skill layer + monitoring/dispatch
.claude/
  skills/                product-owner · ux-designer · design · integration ·
                         scaffold-app · claude-feature · test-automation ·
                         ops-monitor · project-workspace
  agents/                product-owner · ux-designer · app-architect ·
                         firebase-integrator · ui-designer ·
                         claude-feature-builder · qa-engineer · release-monitor
  context/               account-repos.md (live repo index) · routing.md (dispatch)
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
portfolio, and `.claude/context/routing.md` to decide which agent handles what.
See `AGENTS.md`.

### Monitor the pipeline & Pages

```bash
npm run status        # latest CI run + Pages health for every repo in the account
npm run status -- mercato   # filter to one or more repos
npm run status:json   # machine-readable (the release-monitor agent parses this)
npm run repos:sync    # refresh the live repo index in account-repos.md
```

Thin wrappers over the GitHub CLI (`gh auth status` required) — no tokens stored.
`status` exits non-zero if any repo's pipeline failed or Pages errored, so it can
gate CI or feed an alert. The `release-monitor` agent turns a red status into a
diagnosis and routes the fix to the right agent via `routing.md`. Run it on an
interval (`/loop`, cron, or a scheduled cloud agent) for a continuous watch.

### Work on related projects (cross-project workspace)

vibe-stack can pull any repo in the account into a local **workspace**, branch
it, edit it, and push **straight back to that project's own repo and branch**:

```bash
npm run ws list                      # account repos + what's checked out
npm run ws add mercato fix/login     # clone into workspace/mercato on branch fix/login
npm run ws status                    # branch + ahead/behind + uncommitted, per project
npm run ws push mercato -m "fix"     # commit (if -m) and push to origin/fix/login
```

`workspace/` is **gitignored** — the projects are never committed into this
template. Each one is a normal clone with its own `origin`, so an agent gets a
single working tree containing vibe-stack *and* every project it pulled, can
cross-reference patterns, and pushes changes home with an ordinary `git push`.

A safety guard refuses to push to a project's **default branch** unless you pass
`--allow-default` — work on feature branches and open a PR (or merge) from the
compare link it prints.

**Why a workspace of clones, not `git subtree`?** It's deliberate:

| | `git subtree` into vibe-stack | workspace of clones (this) |
|---|---|---|
| Template stays clean | ❌ projects get committed into the template repo | ✅ `workspace/` is gitignored |
| Push back to project | `git subtree push` recomputes split history each time | ✅ plain `git push` to the clone's own origin |
| History | merge/split commits clutter both repos | ✅ each repo keeps its own clean history |
| Two-way drift | easy to diverge and hard to reconcile | ✅ no rejoin step to get wrong |
| Agent ergonomics | one tree, but entangled histories | ✅ one tree, independent repos |

The one thing subtree gives that this doesn't is a *single atomic commit spanning
vibe-stack + a project* — which you almost never want, and which would couple the
template to the projects anyway.

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
