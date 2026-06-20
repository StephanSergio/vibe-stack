---
name: design
description: Apply the vibe-stack design language — Nordic-minimal, mobile-first, token-driven CSS. Use when building or restyling UI (screens, components, layout, color, type, spacing) in a vibe-stack app.
---

# Design

The house style for vibe-stack apps: **Nordic-minimal** — a cool off-white
canvas, near-black ink, generous whitespace, sharp 3px corners, and color held
back to a single restrained accent. Mobile-first. (See `mercato` for a reference
implementation of this exact system.)

## Principles

1. **One accent, used sparingly.** Default everything to ink/grey. Introduce a
   single accent (a restrained red, or a sage/olive) only for state that must be
   noticed — sale, match, active, destructive. Never two loud colors competing.
2. **Hierarchy through size, weight and space — not boxes and borders.** Hairline
   `1px` dividers over heavy cards. Let whitespace separate.
3. **Mobile-first.** Design for a 360–420px viewport. 44px minimum touch targets.
   Bottom navigation, not a top nav bar. Wide content scrolls inside its own
   container; the page body never scrolls horizontally.
4. **Tokens, not magic numbers.** All color, type, spacing, radius live as CSS
   custom properties in `:root`. Components reference tokens only.
5. **Sharp, precise corners.** `--radius: 3px`. Only true circles (icon buttons,
   spinners, status dots) use `border-radius: 50%`.

## Tokens (start from `src/styles/globals.css`)

- **Color:** `--c-bg` (cool off-white), `--c-surface` (white), `--c-ink`
  (near-black text), `--c-muted` (secondary), `--c-line` (hairline borders),
  `--c-accent`, `--c-ok`, `--c-danger`.
- **Type:** DM Sans (or system stack). Display 32–40px / heading 18–22px /
  body 15px / caption 13px / overline 11px uppercase.
- **Spacing:** 8pt grid — 4, 8, 12, 16, 24, 32, 48.
- **Shape:** `--radius: 3px`; soft card shadow only when elevation is meaningful.

## Conventions

- **Icons:** `lucide-react`, `size={16–22}`, `strokeWidth` ~1.6 at rest / ~2.25
  when active. Keep icon weight consistent within a surface.
- **Buttons:** uppercase label, 600 weight, 44px min height. Primary = ink fill;
  ghost = surface + hairline border; danger = danger-colored text/border.
- **State:** an active/selected item gets a 2px accent left-border or a fill —
  pick one and stay consistent across the app.
- **Empty states:** a muted Lucide icon + one line of copy + a clear next action.
- **Motion:** 0.15–0.25s ease transitions; respect `prefers-reduced-motion`.

## Checklist before shipping UI

- [ ] No hard-coded colors/sizes — tokens only.
- [ ] Works at 360px wide; no horizontal body scroll.
- [ ] Touch targets ≥ 44px.
- [ ] One accent color; everything else neutral.
- [ ] Empty, loading, and error states all designed.
- [ ] `prefers-reduced-motion` respected.
