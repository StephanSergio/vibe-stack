---
name: project-workspace
description: Pull a related account repo into vibe-stack's local workspace, branch it, edit it, and push straight back to that project's own repo and branch. Use to make changes to another project (e.g. mercato, CleanFit) from inside vibe-stack.
---

# Cross-project workspace

Lets an agent working in vibe-stack make changes to **another** repo in the
account and push them home — without leaving this working tree and without
polluting the template.

## How it works

`scripts/workspace.mjs` clones a repo into `workspace/<repo>` (which is
**gitignored**). Each project there is a real clone with its own `origin`, so
pushing back is an ordinary `git push` — not `git subtree` (see the README for
why that trade-off was made).

```bash
npm run ws list                      # account repos + what's checked out
npm run ws add <repo> [branch]       # clone into workspace/<repo>, optional branch off default
npm run ws checkout <repo> <branch>  # create/switch a branch
npm run ws status [repo]             # branch + ahead/behind + uncommitted
npm run ws pull <repo>               # fast-forward from origin
npm run ws push <repo> [-m "msg"]    # commit (if -m) + push current branch to its origin
```

## Workflow

1. `npm run ws add <repo> <feature-branch>` — clone + branch off the default.
2. Edit files under `workspace/<repo>/`. Apply that project's own conventions —
   read its `CLAUDE.md`/README first; don't impose vibe-stack's choices.
3. Verify **in that project** (`cd workspace/<repo> && npm run typecheck && lint
   && build`) — each repo has its own toolchain.
4. `npm run ws push <repo> -m "…"` — pushes to `origin/<feature-branch>` and
   prints a compare link to open a PR or merge.

## Rules

- **Never push to a project's default branch** — the script guards against it;
  use a feature branch. Only override with `--allow-default` on explicit request.
- **Respect the target project's conventions and security posture** (its rules,
  its design language) — you're a guest in its repo.
- **Verify in the target repo**, not in vibe-stack — toolchains differ.
- Keep secrets out of commits; the workspace is gitignored for a reason.
- Requires `gh` authenticated. Refresh the project list with `npm run repos:sync`.
