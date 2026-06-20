// ============================================================
// Claude API helper — works via a proxy (recommended) or directly.
// ------------------------------------------------------------
// GitHub Pages is static hosting (no backend), so without a proxy we
// call the Anthropic API straight from the browser, which requires the
// header `anthropic-dangerous-direct-browser-access` and exposes the
// key in the bundle. Prefer the proxy (functions/index.js). See README.
// ============================================================

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const PROXY_URL = import.meta.env.VITE_CLAUDE_PROXY_URL
const DEFAULT_MODEL = 'claude-sonnet-4-6'

// AI features work if either a proxy or a direct key is configured.
export const isClaudeEnabled = Boolean(PROXY_URL || API_KEY)

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AskClaudeOptions {
  system?: string
  messages: ClaudeMessage[]
  maxTokens?: number
  model?: string
}

interface AnthropicTextBlock {
  type: string
  text?: string
}
interface AnthropicResponse {
  content?: AnthropicTextBlock[]
  error?: { message?: string }
}

// Low-level call: returns the concatenated text of the response.
export async function askClaude(opts: AskClaudeOptions): Promise<string> {
  if (!isClaudeEnabled) {
    throw new Error('Claude is disabled (no proxy or API key set).')
  }

  const payload = {
    model: opts.model || DEFAULT_MODEL,
    max_tokens: opts.maxTokens ?? 1024,
    system: opts.system,
    messages: opts.messages,
  }

  const res = PROXY_URL
    ? await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    : await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY as string,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify(payload),
      })

  if (!res.ok) {
    let detail = ''
    try {
      const err = (await res.json()) as AnthropicResponse
      detail = err?.error?.message || ''
    } catch {
      /* ignore parse error */
    }
    throw new Error(`Claude request failed (${res.status}). ${detail}`.trim())
  }

  const data = (await res.json()) as AnthropicResponse
  return (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('\n')
}

// Convenience: ask for JSON and parse the first {...} object out of it.
export async function askClaudeForJson<T>(opts: AskClaudeOptions): Promise<T> {
  const text = await askClaude(opts)
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) {
    throw new Error('No JSON found in Claude response.')
  }
  return JSON.parse(text.slice(start, end + 1)) as T
}
