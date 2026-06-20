import { useState } from 'react'
import { Sparkles, Zap } from 'lucide-react'
import { isFirebaseConfigured } from './firebase'
import { askClaude, isClaudeEnabled } from './lib/claude'

// Minimal landing screen — proof that Firebase + Claude wiring works.
// Replace this with your app. The plumbing (firebase.ts, lib/claude.ts,
// the proxy, and the Pages deploy) is what the starter gives you.
export default function App() {
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function ping() {
    setLoading(true)
    setError('')
    try {
      const text = await askClaude({
        system: 'You are a friendly assistant. Answer in one short sentence.',
        messages: [{ role: 'user', content: 'Say hello and confirm the wiring works.' }],
        maxTokens: 100,
      })
      setAnswer(text)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="shell">
      <header className="hero">
        <h1>vibe-stack</h1>
        <p className="muted">GitHub Pages · Firebase · Claude AI — starter</p>
      </header>

      <section className="card">
        <h2>Status</h2>
        <ul className="status">
          <li>
            <span className={isFirebaseConfigured ? 'dot dot--ok' : 'dot'} />
            Firebase {isFirebaseConfigured ? 'configured' : 'not configured'}
          </li>
          <li>
            <span className={isClaudeEnabled ? 'dot dot--ok' : 'dot'} />
            Claude {isClaudeEnabled ? 'enabled' : 'disabled'}
          </li>
        </ul>
      </section>

      <section className="card">
        <h2>Try Claude</h2>
        <button
          type="button"
          className="btn"
          onClick={ping}
          disabled={loading || !isClaudeEnabled}
        >
          <Sparkles size={16} /> {loading ? 'Asking…' : 'Ping Claude'}
        </button>
        {answer && <p className="answer">{answer}</p>}
        {error && <p className="error">{error}</p>}
      </section>

      <footer className="foot">
        <a href="https://github.com/StephanSergio/vibe-stack" className="muted">
          <Zap size={14} /> Built from vibe-stack
        </a>
      </footer>
    </div>
  )
}
