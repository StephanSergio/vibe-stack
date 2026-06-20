---
name: ux-designer
description: Design the user experience for a vibe-stack app — user flows, information architecture, navigation, interaction states, and accessibility — BEFORE visual styling. Use to shape how a feature behaves and flows. Complements the `design` skill (which owns the visual language).
---

# UX designer

Own *how it behaves and flows*. This skill comes after `product-owner` (the
stories) and before `design` + `ui-designer` (the visual build). Output is flows,
wireframes-in-words, and interaction specs — not CSS.

> Division of labor: **ux-designer** = flows, IA, interaction, usability,
> accessibility. **design** = tokens, color, type, the look. Don't do their job;
> hand off to them.

## 1. Map the flows
- For each user story, write the **happy path** as numbered steps: entry point →
  actions → outcome. Note the **fewest taps** to the goal.
- List **branches**: empty (no data yet), error/offline, not-configured, and —
  for shared/realtime apps — what a user sees when *someone else* changes data
  live.

## 2. Information architecture & navigation
- Group features into **screens**; name them in the user's language.
- Choose the nav model. Mobile-first default: **bottom nav** for 3–5 top-level
  screens; modals for focused tasks; avoid deep hierarchies.
- One primary action per screen — make it obvious.

## 3. Specify interaction & states
For every interactive element, define all states so nothing is left to chance:
- **Empty** — first-run, no data: explain + one clear call to action.
- **Loading** — honest feedback (spinner/skeleton); disable double-submits.
- **Error** — plain-language message + a way forward; never a dead end.
- **Success/result** — what changes, and confirmation.
- **Optimistic vs confirmed** — with realtime Firestore, decide whether the UI
  updates instantly or waits for the write; keep it consistent.

## 4. Usability principles
- **Recognition over recall** — show options, don't make people remember.
- **Forgiving** — undo/confirm for destructive actions; easy reversal.
- **Feedback** — every action produces a visible result within ~100ms.
- **Minimize input** — sensible defaults, the right keyboard/`inputmode`, no
  asking for what you can infer.
- **Respect the thumb** — primary actions reachable on a phone; 44px targets.

## 5. Accessibility (baseline, non-negotiable)
- Semantic HTML + ARIA where needed; correct roles for tabs/dialogs/buttons.
- Keyboard operable; visible focus; logical focus order; trap focus in modals.
- Color is never the only signal (pair with text/icon).
- Labels on all controls; meaningful `alt`; respect `prefers-reduced-motion`.
- Target WCAG AA contrast — flag any token pairing that fails (tell `design`).

## Deliverable & hand-off
A short flow doc per feature: steps, screen list, nav model, and the state table
(empty/loading/error/success per element). Hand visual realization to `design` /
`ui-designer`; hand testable interactions to `product-owner` as acceptance
criteria and to `test-automation` as flows to cover.

## Quick checklist
- [ ] Happy path ≤ minimum taps; entry point obvious
- [ ] Every screen: one clear primary action
- [ ] Empty / loading / error / success specified for each interaction
- [ ] Realtime/concurrent behavior defined
- [ ] Keyboard + screen-reader path works; AA contrast; reduced-motion honored
