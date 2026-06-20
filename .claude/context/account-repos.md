# Account repositories — shared context

Context on the apps in the **StephanSergio** GitHub account, so an agent working
in `vibe-stack` knows what already exists, can reuse patterns, and stays
consistent across the portfolio. These apps are the reason vibe-stack exists:
they share one stack, and vibe-stack distills it.

> Keep this file current. Regenerate with:
> `gh repo list --limit 200 --json name,description,primaryLanguage,isPrivate,pushedAt`
> (last refreshed: 2026-06).

## The shared stack ("vibe-stack")

Every app below is the same shape, which is exactly what this starter captures:

- **Vite + React 19 + TypeScript** (bundler-mode tsconfig, strict).
- **Firebase / Firestore** for data; realtime via `onSnapshot` hooks.
- **Claude API** for AI features, called via a Firebase Function proxy (key
  server-side) or directly from the browser for throwaway keys.
- **GitHub Pages** for hosting, deployed by an Actions workflow on push to
  `main`. `vite.config.ts` `base` = `/<repo>/`.
- **ESLint flat config**, `lucide-react` icons, Nordic-minimal CSS.

## Repos

### mercato — Grocery list app  ·  public  ·  TypeScript
A collaborative family grocery list. The **reference implementation** of the
vibe-stack design + integration patterns.
- Realtime shared shopping list (no auth; open Firestore rules — trusted family
  use), ingredient browser, admin CRUD, per-item quantities.
- **Claude features:** recipe generator (from your list) and "Match — Tinder voor
  eten" (swipe dishes; a match when two people both pick one; lock a weekly menu).
  Both go through the recipe/dishes proxy mode.
- Dutch UI. Nordic-minimal design language (the basis of the `design` skill).
- https://github.com/StephanSergio/mercato

### CleanFit — Fitness app  ·  public  ·  TypeScript
Personal fitness app, **with authentication** — the auth-guarded counterpart to
mercato's open model. Same Vite + Firebase + Pages stack; uses Firebase Auth and
auth-scoped Firestore rules. Reference this when an app needs accounts and
per-user data ownership.
- https://github.com/StephanSergio/CleanFit

### desktop-tutorial  ·  private
GitHub Desktop tutorial scratch repo. Not part of the app portfolio; ignore for
engineering decisions.

## How an agent should use this

- **Reuse, don't reinvent:** before building a hook, screen, or AI feature, check
  how `mercato` (open/collab) or `CleanFit` (auth) already solved it.
- **Match conventions:** `COLLECTIONS` map, one-hook-per-collection, tokens-only
  CSS, proxy-first Claude calls.
- **Pick the right posture:** trusted-private/collaborative → mercato's open
  rules; accounts/per-user data → CleanFit's auth-guarded rules.
