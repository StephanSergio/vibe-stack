// Shared helpers for the ops scripts. Thin wrappers over the `gh` CLI so we
// stay dependency-free. Requires GitHub CLI installed and authenticated
// (`gh auth status`).

import { execFileSync } from 'node:child_process'

// Run `gh ...` and return stdout (string). Throws on non-zero exit.
export function gh(args, { allowFail = false } = {}) {
  try {
    return execFileSync('gh', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 32 * 1024 * 1024,
    })
  } catch (e) {
    if (allowFail) return ''
    const msg = e.stderr?.toString() || e.message
    throw new Error(`gh ${args.join(' ')} failed: ${msg.trim()}`)
  }
}

// Run a `gh` command expected to emit JSON and parse it. Returns `fallback`
// (default null) if the call fails or output isn't JSON — callers decide.
export function ghJson(args, { fallback = null } = {}) {
  const out = gh(args, { allowFail: true }).trim()
  if (!out) return fallback
  try {
    return JSON.parse(out)
  } catch {
    return fallback
  }
}

// The authenticated account login, or GH_OWNER override.
export function owner() {
  if (process.env.GH_OWNER) return process.env.GH_OWNER
  const me = ghJson(['api', 'user'], { fallback: {} })
  if (!me?.login) {
    throw new Error('Could not resolve GitHub account. Run `gh auth login`.')
  }
  return me.login
}

// All source repos (no forks) for the account, newest push first.
export function listRepos() {
  const repos =
    ghJson(
      [
        'repo',
        'list',
        '--no-archived',
        '--source',
        '--limit',
        '200',
        '--json',
        'name,description,isPrivate,pushedAt,primaryLanguage,url',
      ],
      { fallback: [] }
    ) || []
  return repos.sort((a, b) => (a.pushedAt < b.pushedAt ? 1 : -1))
}

// ANSI helpers (skipped when not a TTY or NO_COLOR is set).
const useColor = process.stdout.isTTY && !process.env.NO_COLOR
const wrap = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s)
export const c = {
  dim: wrap('2'),
  bold: wrap('1'),
  green: wrap('32'),
  red: wrap('31'),
  yellow: wrap('33'),
  cyan: wrap('36'),
}
