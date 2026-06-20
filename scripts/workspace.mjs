#!/usr/bin/env node
// ============================================================
// workspace.mjs — pull related repos into a local workspace, branch
// them, and push straight back to their own repo + branch.
// ------------------------------------------------------------
// vibe-stack stays a clean template: the workspace lives under
// `workspace/` which is gitignored. Each project there is a REAL clone
// with its own `origin`, so "push into the related project" is a normal
// git push — no `git subtree` split/rejoin, no history pollution.
//
// Usage:
//   node scripts/workspace.mjs list                  # account repos + what's checked out
//   node scripts/workspace.mjs add <repo> [branch]   # clone into workspace/<repo>, optional branch
//   node scripts/workspace.mjs checkout <repo> <branch>
//   node scripts/workspace.mjs status [repo]         # branch + ahead/behind + dirty
//   node scripts/workspace.mjs pull <repo>           # fast-forward from origin
//   node scripts/workspace.mjs push <repo> [-m "msg"] [--allow-default]
//
// Requires the GitHub CLI authenticated (`gh auth status`).
// ============================================================

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { ghJson, owner, listRepos, c } from './lib.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const WORKSPACE = join(ROOT, 'workspace')

const [cmd, ...rest] = process.argv.slice(2)
const flags = rest.filter((a) => a.startsWith('-'))
const args = rest.filter((a) => !a.startsWith('-'))
const flagValue = (name) => {
  const i = rest.indexOf(name)
  return i !== -1 ? rest[i + 1] : undefined
}

function git(cwd, gitArgs, { allowFail = false } = {}) {
  try {
    return execFileSync('git', gitArgs, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim()
  } catch (e) {
    if (allowFail) return ''
    throw new Error(`git ${gitArgs.join(' ')} failed: ${(e.stderr || e.message).toString().trim()}`)
  }
}

const repoDir = (name) => join(WORKSPACE, name)
const isCloned = (name) => existsSync(join(repoDir(name), '.git'))

function defaultBranch(name) {
  const info = ghJson(['repo', 'view', `${owner()}/${name}`, '--json', 'defaultBranchRef'])
  return info?.defaultBranchRef?.name || 'main'
}

function die(msg) {
  console.error(c.red(`✗ ${msg}`))
  process.exit(1)
}

// ── commands ────────────────────────────────────────────────

function cmdList() {
  const repos = listRepos()
  console.log(c.bold(`\n  ${owner()} — projects\n`))
  for (const r of repos) {
    const here = isCloned(r.name)
    const mark = here ? c.green('✓ in workspace') : c.dim('· not cloned')
    const branch = here ? c.cyan(git(repoDir(r.name), ['branch', '--show-current'], { allowFail: true })) : ''
    console.log(`  ${r.name.padEnd(18)} ${mark}  ${branch}`)
  }
  console.log(c.dim('\n  add one with:  node scripts/workspace.mjs add <repo> [branch]\n'))
}

function cmdAdd(name, branch) {
  if (!name) die('usage: add <repo> [branch]')
  mkdirSync(WORKSPACE, { recursive: true })
  if (!isCloned(name)) {
    console.log(c.dim(`Cloning ${owner()}/${name} …`))
    execFileSync('gh', ['repo', 'clone', `${owner()}/${name}`, repoDir(name)], {
      stdio: 'inherit',
    })
  } else {
    git(repoDir(name), ['fetch', 'origin'], { allowFail: true })
    console.log(c.dim(`${name} already cloned — fetched latest.`))
  }
  if (branch) cmdCheckout(name, branch)
  else console.log(c.green(`✓ ${name} ready in workspace/${name}`))
}

function cmdCheckout(name, branch) {
  if (!isCloned(name)) die(`${name} isn't in the workspace — run: add ${name}`)
  if (!branch) die('usage: checkout <repo> <branch>')
  const base = defaultBranch(name)
  git(repoDir(name), ['fetch', 'origin'], { allowFail: true })
  // Reuse the branch if it exists locally, else branch off the default.
  const exists = git(repoDir(name), ['branch', '--list', branch], { allowFail: true })
  if (exists) git(repoDir(name), ['checkout', branch])
  else git(repoDir(name), ['checkout', '-b', branch, `origin/${base}`])
  console.log(c.green(`✓ ${name} on branch ${c.cyan(branch)} (off ${base})`))
}

function cmdStatus(name) {
  const names = name ? [name] : listRepos().map((r) => r.name).filter(isCloned)
  if (!names.length) return console.log(c.dim('  Nothing in the workspace yet.'))
  console.log(c.bold('\n  workspace status\n'))
  for (const n of names) {
    if (!isCloned(n)) { console.log(`  ${n}: ${c.dim('not cloned')}`); continue }
    const branch = git(repoDir(n), ['branch', '--show-current'], { allowFail: true })
    const dirty = git(repoDir(n), ['status', '--porcelain'], { allowFail: true })
    const ahead = git(repoDir(n), ['rev-list', '--count', '@{upstream}..HEAD'], { allowFail: true }) || '0'
    const dirtyN = dirty ? dirty.split('\n').filter(Boolean).length : 0
    const state =
      (dirtyN ? c.yellow(`${dirtyN} uncommitted`) : c.green('clean')) +
      (Number(ahead) ? c.cyan(` · ${ahead} to push`) : '')
    console.log(`  ${c.bold(n.padEnd(18))} ${c.cyan((branch || '?').padEnd(16))} ${state}`)
  }
  console.log()
}

function cmdPull(name) {
  if (!isCloned(name)) die(`${name} isn't in the workspace — run: add ${name}`)
  git(repoDir(name), ['pull', '--ff-only'], { allowFail: false })
  console.log(c.green(`✓ ${name} updated`))
}

function cmdPush(name) {
  if (!isCloned(name)) die(`${name} isn't in the workspace — run: add ${name}`)
  const dir = repoDir(name)
  const branch = git(dir, ['branch', '--show-current'])
  if (!branch) die('detached HEAD — checkout a branch first')

  // Safety: don't push straight to the project's default branch unless asked.
  if (branch === defaultBranch(name) && !flags.includes('--allow-default')) {
    die(
      `refusing to push to default branch "${branch}". ` +
        `Use a feature branch (checkout ${name} <branch>) or pass --allow-default.`
    )
  }

  const message = flagValue('-m') || flagValue('--message')
  const dirty = git(dir, ['status', '--porcelain'], { allowFail: true })
  if (dirty) {
    if (!message) die('working tree has changes — commit them, or pass -m "message" to commit all.')
    git(dir, ['add', '-A'])
    git(dir, ['commit', '-m', message])
    console.log(c.dim(`committed: ${message}`))
  }
  // -u sets upstream the first time; pushes to the SAME branch on origin.
  execFileSync('git', ['push', '-u', 'origin', branch], { cwd: dir, stdio: 'inherit' })
  console.log(c.green(`\n✓ pushed ${name} → origin/${branch}`))
  const compare = `https://github.com/${owner()}/${name}/compare/${branch}?expand=1`
  console.log(c.dim(`  open a PR (or merge):\n  ${compare}\n`))
}

// ── dispatch ─────────────────────────────────────────────────

try {
  switch (cmd) {
    case 'list': cmdList(); break
    case 'add': cmdAdd(args[0], args[1]); break
    case 'checkout': cmdCheckout(args[0], args[1]); break
    case 'status': cmdStatus(args[0]); break
    case 'pull': cmdPull(args[0]); break
    case 'push': cmdPush(args[0]); break
    default:
      console.log(`workspace.mjs — pull related repos, branch, push back.

  list                      account repos + what's checked out
  add <repo> [branch]       clone into workspace/<repo> (optional branch)
  checkout <repo> <branch>  create/switch a branch
  status [repo]             branch + ahead/behind + dirty
  pull <repo>               fast-forward from origin
  push <repo> [-m "msg"]    push current branch to its origin (--allow-default to override guard)`)
  }
} catch (e) {
  die(e.message)
}
