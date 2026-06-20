// ============================================================
// Firebase Cloud Function: a thin, generic proxy for the Claude API.
// ------------------------------------------------------------
// Keeps the Anthropic API key SERVER-SIDE. The browser sends a
// { system, messages, max_tokens, model } payload; this function adds
// the key and forwards it to Claude. Point the frontend variable
// VITE_CLAUDE_PROXY_URL at this function's URL to use it.
//
// Set the key once:
//   firebase functions:secrets:set ANTHROPIC_API_KEY
//
// Deploy:
//   firebase deploy --only functions
// ============================================================

const { onRequest } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY')

// Default model — see https://docs.anthropic.com for current model ids.
const DEFAULT_MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS_CAP = 4096

// Restrict which origins may call the proxy. Add your Pages domain(s).
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://<your-user>.github.io',
]

exports.claude = onRequest(
  { secrets: [ANTHROPIC_API_KEY], cors: ALLOWED_ORIGINS },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: { message: 'POST only.' } })
      return
    }

    const { system, messages, max_tokens, model } = req.body || {}
    if (!Array.isArray(messages) || messages.length === 0) {
      res
        .status(400)
        .json({ error: { message: 'Provide a non-empty "messages" array.' } })
      return
    }

    try {
      const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY.value(),
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model || DEFAULT_MODEL,
          max_tokens: Math.min(Number(max_tokens) || 1024, MAX_TOKENS_CAP),
          ...(system ? { system } : {}),
          messages,
        }),
      })

      const data = await apiRes.json()
      // Pass the Anthropic response straight through; the client parses it.
      res.status(apiRes.status).json(data)
    } catch (e) {
      res
        .status(502)
        .json({ error: { message: 'Proxy error: ' + (e.message || e) } })
    }
  }
)
