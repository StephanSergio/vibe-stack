---
name: claude-feature
description: Add an AI feature end-to-end in a vibe-stack app — prompt design, the askClaude call, structured JSON output, loading/error UI, and (optionally) persisting results to Firestore. Use when building anything powered by Claude.
---

# Build a Claude-powered feature

The repeatable recipe for adding an AI capability. (Reference: `mercato`'s recipe
generator and the "Tinder for food" dish suggester.)

## 1. Decide the contract first
- What does the user give, and what shape comes back? Define a TS interface for
  the output in `src/types.ts` **before** writing the prompt.
- Will results be saved? If yes, model the Firestore collection now.

## 2. Write the prompt
- A focused `system` prompt that sets role + output format.
- For structured data: instruct "Return ONLY JSON" and give the exact schema in
  the prompt. Keep the example minimal and valid.

## 3. Call Claude
- Use `askClaudeForJson<T>()` from `src/lib/claude.ts` for structured output, or
  `askClaude()` for free text.
- Keep `maxTokens` tight. Pick the model deliberately (default sonnet).
- If the feature needs server-side prompt logic or different modes, extend the
  proxy (`functions/index.js`) and branch on a body field — keep the key
  server-side. Provide a graceful fallback if the proxy/key is absent.

## 4. Build the UI states
- **Disabled:** if `isClaudeEnabled` is false, show a friendly "set a key/proxy"
  notice — never a broken button.
- **Loading:** spinner + honest copy.
- **Error:** surface `e.message`; never swallow failures.
- **Result:** render per the `design` skill.

## 5. Persist (optional)
- Write results through a hook (`addDoc` / `setDoc`). Denormalize what you render.
- Realtime read-back via `onSnapshot` so collaborators see it instantly.

## Guardrails
- Never trust model output blindly — validate/parse defensively (the response may
  wrap JSON in prose; parse the first `{...}` block).
- Always provide a non-AI fallback path where feasible (e.g. a static default
  set) so the app works even when AI is off.
- Treat the direct browser key as public. Prefer the proxy for anything real.
