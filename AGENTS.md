# Agentic architecture

vibe-stack ships an **agent layer** so Claude Code (or any agent) can build and
extend apps on this stack consistently. It is a small, opinionated org chart:
specialized agents, each backed by a skill, coordinated by a plan.

```
                    ┌─────────────────┐
   goal ──────────► │  app-architect  │  plans: data model, screens,
                    │   (plan only)   │  AI touchpoints, build order
                    └────────┬────────┘
                             │ hands off an ordered checklist
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐  ┌──────────────────┐  ┌────────────────────────┐
│ firebase-     │  │   ui-designer    │  │ claude-feature-builder │
│ integrator    │  │  (design skill)  │  │  (claude-feature skill)│
│ (integration) │  └──────────────────┘  └────────────────────────┘
└───────────────┘
        └──────────── verify: typecheck · lint · build · deploy ───────────┘
```

## Agents (`.claude/agents/`)

| Agent | Backed by skill | Responsibility |
|-------|-----------------|----------------|
| `app-architect` | — | Decompose a goal into data model, UI, AI touchpoints, build order. **Plans, never edits.** |
| `firebase-integrator` | `integration` | Collections, realtime hooks, rules, auth. |
| `ui-designer` | `design` | Screens, components, tokens, mobile-first polish. |
| `claude-feature-builder` | `claude-feature` | Prompts, `askClaude` calls, proxy, AI UI states. |

## Skills (`.claude/skills/`)

- **`design`** — the Nordic-minimal design language and UI checklist.
- **`integration`** — Firebase + Claude proxy + Pages deploy wiring and failure modes.
- **`scaffold-app`** — spin up a new named, deployable app from this starter.
- **`claude-feature`** — add an AI feature end-to-end.

## Shared context (`.claude/context/`)

- **`account-repos.md`** — every app in the GitHub account, the shared stack, and
  which app to reference for which posture (open/collab vs auth). Agents read this
  to reuse patterns instead of reinventing them. Keep it refreshed with `gh`.

## How to drive it

1. **Plan first** for anything non-trivial: delegate to `app-architect`, get the
   ordered checklist.
2. **Fan out** the checklist to `firebase-integrator`, `ui-designer`, and
   `claude-feature-builder`. Independent slices can run in parallel; respect the
   dependency order (types → data → hooks → UI → wiring).
3. **Verify every slice:** `npm run typecheck && npm run lint && npm run build`.
4. **Ship** via the `scaffold-app` deploy steps (or just push to `main` for an
   existing app).

The agents and skills are plain markdown — edit them as the stack evolves.
