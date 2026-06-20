---
name: test-automation
description: Set up and write automated tests for a vibe-stack app — Vitest + React Testing Library for unit/component, Playwright for E2E, with Firebase and Claude mocked. Use when adding tests, a test harness, or a CI test gate.
---

# Test automation

The testing approach for vibe-stack apps. Goal: fast, deterministic tests that
run offline (no real Firestore, no real Claude calls) and gate the deploy.

## The pyramid for this stack

1. **Unit (most)** — pure logic: `src/lib/*` (e.g. slug/date/JSON helpers),
   reducers, derivations like "is this a match?". No React, no network. Fast.
2. **Component / hook (some)** — render components and exercise realtime hooks
   with **Firebase mocked**. Assert behavior, not implementation.
3. **E2E (few)** — a handful of critical user flows in a real browser via
   Playwright, against `npm run dev` or the built `preview`, with the network to
   Firestore/Claude stubbed.

## Setup

```bash
npm i -D vitest @testing-library/react @testing-library/user-event \
        @testing-library/jest-dom jsdom
npm i -D @playwright/test   # E2E only
```

`vite.config.ts` — add a test block (Vite + Vitest share one config):

```ts
/// <reference types="vitest/config" />
export default defineConfig({
  base: '/<repo>/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
  },
})
```

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

`package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test"
```

## What to test (and how)

- **Pure lib** — straight input/output. These are your cheapest, highest-value
  tests; cover edge cases here (empty input, accents, week boundaries, malformed
  JSON from Claude).
- **Realtime hooks** — mock the Firestore SDK so `onSnapshot` feeds canned docs
  and writes are spied, not sent:

  ```ts
  vi.mock('firebase/firestore', () => ({
    collection: vi.fn(), doc: vi.fn(),
    onSnapshot: (_q, cb) => { cb({ docs: FAKE_DOCS }); return () => {} },
    addDoc: vi.fn(), updateDoc: vi.fn(), deleteDoc: vi.fn(),
    serverTimestamp: () => null,
  }))
  ```

  Assert the derived state and that writes were called with the right payload.
- **Claude features** — mock `src/lib/claude.ts` (`askClaude`/`askClaudeForJson`)
  to return fixtures. Test the disabled / loading / error / result states. Never
  hit the real API in tests.
- **Components** — query by role/text (`getByRole`, `getByText`), drive with
  `userEvent`, assert what the user sees. Avoid testing internal state.

## E2E (Playwright)

- Cover only flows that would be embarrassing to break (e.g. add item → it
  appears; both users match a dish → it shows). Stub network with `page.route`
  so runs are deterministic and offline.

## CI gate

Add a `test` job to `.github/workflows/` (or extend `deploy.yml`) that runs
`npm ci && npm run typecheck && npm run lint && npm run test` and **blocks deploy
on failure**. Keep unit+component under a few seconds; gate E2E separately if slow.

## Rules

- Deterministic only — no real network, no wall-clock/random without control
  (inject or freeze). Tests must pass offline.
- Test behavior, not implementation; refactors shouldn't break green tests.
- Colocate as `*.test.ts(x)` next to the source, or under `src/**/__tests__`.
- A bug fix gets a regression test that fails before the fix.
