---
name: ops-monitor
description: Monitor CI pipelines and GitHub Pages across the account's repos, then triage failures by routing them to the right agent + skill. Use to check deploy health, investigate a red pipeline or broken Pages site, or run a periodic watch.
---

# Ops monitor

Gives the project eyes on its own delivery: which pipelines are green, which Pages
sites are live, and — when something breaks — which agent to spin up to fix it.

## Check status

```bash
npm run status            # all repos: latest CI run + Pages, with a health mark
npm run status -- mercato # one or more repos by name
npm run status:json       # machine-readable (for an agent to parse)
```

`scripts/status.mjs` exits non-zero if any repo has a failed run or an errored
Pages build — so it doubles as a gate or an alert trigger. Repos and their live
URLs come from `.claude/context/account-repos.md`; refresh it with
`npm run repos:sync`.

> Requires the GitHub CLI authenticated (`gh auth status`). Everything is a thin
> wrapper over `gh` — no tokens stored in the repo.

## Investigate a failure

1. **Identify** the failing repo/run: `npm run status:json`.
2. **Read the logs:** `gh run view -R <owner>/<repo> <run-id> --log-failed`.
3. **Classify** the failure and route it (see `.claude/context/routing.md`):
   - *Pages "Not Found" / 404 on deploy* → Pages not enabled. Enable it
     (Settings → Pages → Source = GitHub Actions) — not a code bug.
   - *Blank deployed site* → wrong `base` in `vite.config.ts` → `ui-designer`/build.
   - *`tsc`/`eslint` failure* → the relevant build agent fixes the diff.
   - *Test failure* → `qa-engineer`.
   - *Missing env/secret at build* → set the Actions secret (`integration` skill).
   - *Firestore/Claude/CORS runtime error* → `firebase-integrator` / `claude-feature-builder`.
4. **Fix, push, re-watch** until `npm run status` is all green.

## Watch continuously (optional)

- Ad hoc: `gh run watch -R <owner>/<repo>` follows a run to completion.
- Recurring: drive `npm run status` on an interval (e.g. Claude Code's `/loop`,
  a cron, or a scheduled cloud agent) and act on a non-zero exit.

## Keep context fresh

Run `npm run repos:sync` when repos are added/renamed (or
`node scripts/sync-repos.mjs --check` in CI) so agents always reason over the
real portfolio, not a stale list.
