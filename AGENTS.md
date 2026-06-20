# Agentic architecture

vibe-stack ships an **agent layer** so Claude Code (or any agent) can build and
extend apps on this stack consistently. It is a small, opinionated org chart:
specialized agents, each backed by a skill, taking a feature from idea → flows →
plan → build → tested & shipped.

```
  idea
   │
   ▼
┌────────────────┐   stories + acceptance criteria
│ product-owner  │ ─────────────┐
│  (what & why)  │              │
└────────────────┘              ▼
                        ┌────────────────┐  flows, IA, interaction states
                        │  ux-designer   │ ──────────┐
                        │ (how it flows) │           │
                        └────────────────┘           ▼
                                            ┌─────────────────┐  data model,
                                            │  app-architect  │  AI touchpoints,
                                            │   (plan only)   │  build order
                                            └────────┬────────┘
                       ┌─────────────────────────────┼─────────────────────────┐
                       ▼                             ▼                          ▼
              ┌──────────────────┐       ┌──────────────────┐     ┌────────────────────────┐
              │ firebase-        │       │   ui-designer    │     │ claude-feature-builder │
              │ integrator       │       │  (design skill)  │     │  (claude-feature skill)│
              └──────────────────┘       └──────────────────┘     └────────────────────────┘
                       └───────────────► ┌──────────────┐ ◄───────────────┘
                                         │ qa-engineer  │  tests every slice
                                         │(test-automa.)│
                                         └──────┬───────┘
                                                ▼
                              verify: typecheck · lint · test · build · deploy
```

## Agents (`.claude/agents/`)

| Agent | Backed by skill | Responsibility |
|-------|-----------------|----------------|
| `product-owner` | `product-owner` | Stories, acceptance criteria, MVP cut, prioritized backlog. **Defines what/why; no code.** |
| `ux-designer` | `ux-designer` | Flows, IA, navigation, interaction states, accessibility. **Specs behavior; no CSS.** |
| `app-architect` | — | Data model, UI map, AI touchpoints, build order. **Plans, never edits.** |
| `firebase-integrator` | `integration` | Collections, realtime hooks, rules, auth. |
| `ui-designer` | `design` | Screens, components, tokens, mobile-first polish. |
| `claude-feature-builder` | `claude-feature` | Prompts, `askClaude` calls, proxy, AI UI states. |
| `qa-engineer` | `test-automation` | Vitest/RTL unit+component, Playwright E2E, CI gate. |

## Skills (`.claude/skills/`)

- **`product-owner`** — idea → stories, acceptance criteria, MVP, prioritization.
- **`ux-designer`** — user flows, IA, interaction states, accessibility (the *how it behaves*).
- **`design`** — the Nordic-minimal visual language and UI checklist (the *how it looks*).
- **`integration`** — Firebase + Claude proxy + Pages deploy wiring and failure modes.
- **`scaffold-app`** — spin up a new named, deployable app from this starter.
- **`claude-feature`** — add an AI feature end-to-end.
- **`test-automation`** — Vitest + RTL + Playwright, with Firebase/Claude mocked, gating deploy.

## Shared context (`.claude/context/`)

- **`account-repos.md`** — every app in the GitHub account, the shared stack, and
  which app to reference for which posture (open/collab vs auth). Agents read this
  to reuse patterns instead of reinventing them. Keep it refreshed with `gh`.

## How to drive it

1. **Define** with `product-owner`: stories + acceptance criteria + an MVP cut.
2. **Shape** with `ux-designer`: flows, screens, navigation, interaction states.
3. **Plan** with `app-architect`: data model, AI touchpoints, dependency-ordered
   build checklist.
4. **Build** by fanning the checklist to `firebase-integrator`, `ui-designer`,
   and `claude-feature-builder`. Independent slices run in parallel; respect the
   order (types → data → hooks → UI → wiring).
5. **Test** with `qa-engineer`: cover acceptance criteria; add the CI gate.
6. **Verify & ship:** `npm run typecheck && npm run lint && npm run test &&
   npm run build`, then deploy via the `scaffold-app` steps (or push to `main`).

Scale to the task: a tiny tweak skips straight to a build agent; a new feature
runs the whole chain. The agents and skills are plain markdown — edit them as the
stack evolves.
