#!/usr/bin/env node
// ============================================================
// status.mjs — pipeline + GitHub Pages health across the account.
// ------------------------------------------------------------
// For every source repo: latest GitHub Actions run (status/conclusion)
// and GitHub Pages deployment (live URL + last build status).
//
// Usage:
//   node scripts/status.mjs            # all repos
//   node scripts/status.mjs mercato    # one or more repos by name
//   GH_OWNER=someone node scripts/status.mjs
//   node scripts/status.mjs --json     # machine-readable, for agents
//
// Exit code is non-zero if any monitored repo has a failed run or an
// errored Pages build — so it can gate CI or trigger a fix.
// ============================================================

import { ghJson, owner, listRepos, c } from './lib.mjs'

const args = process.argv.slice(2)
const asJson = args.includes('--json')
const names = args.filter((a) => !a.startsWith('--'))

const account = owner()
let repos = listRepos()
if (names.length) repos = repos.filter((r) => names.includes(r.name))
if (!repos.length) {
  console.error('No matching repos.')
  process.exit(2)
}

function latestRun(repo) {
  const runs = ghJson(
    [
      'run',
      'list',
      '-R',
      `${account}/${repo}`,
      '--limit',
      '1',
      '--json',
      'workflowName,status,conclusion,headBranch,createdAt,url',
    ],
    { fallback: [] }
  )
  return runs?.[0] || null
}

function pages(repo) {
  // 404 when Pages isn't enabled — ghJson returns null, which we treat as "off".
  const info = ghJson(['api', `repos/${account}/${repo}/pages`])
  if (!info) return null
  // Workflow-driven Pages doesn't populate the legacy builds API; its health is
  // the deploy run's conclusion. Only legacy ("build_type: legacy") Pages report
  // a build status here.
  if (info.build_type === 'workflow') {
    return { url: info.html_url, buildType: 'workflow', buildStatus: 'via-actions' }
  }
  const build = ghJson(['api', `repos/${account}/${repo}/pages/builds/latest`])
  return {
    url: info.html_url,
    buildType: info.build_type,
    buildStatus: build?.status ?? 'unknown',
  }
}

const report = []
let problems = 0

for (const r of repos) {
  const run = latestRun(r.name)
  const pg = pages(r.name)
  const runBad = run && run.conclusion && run.conclusion !== 'success'
  const pgBad = pg && pg.buildStatus === 'errored'
  if (runBad || pgBad) problems++
  report.push({ repo: r.name, run, pages: pg, healthy: !(runBad || pgBad) })
}

if (asJson) {
  console.log(JSON.stringify({ account, problems, repos: report }, null, 2))
  process.exit(problems ? 1 : 0)
}

const mark = (ok) => (ok ? c.green('●') : c.red('●'))
const runLabel = (run) => {
  if (!run) return c.dim('no runs')
  if (run.status !== 'completed') return c.yellow(run.status)
  return run.conclusion === 'success'
    ? c.green('success')
    : c.red(run.conclusion || 'failed')
}
const pgLabel = (pg) => {
  if (!pg) return c.dim('pages off')
  const s = pg.buildStatus
  if (s === 'via-actions') return c.cyan('pages:via-actions')
  const color = s === 'built' ? c.green : s === 'errored' ? c.red : c.yellow
  return color(`pages:${s}`)
}

console.log(c.bold(`\n  ${account} — pipeline & pages\n`))
for (const r of report) {
  console.log(
    `  ${mark(r.healthy)} ${c.bold(r.repo.padEnd(18))} ` +
      `${runLabel(r.run).padEnd(20)} ${pgLabel(r.pages)}`
  )
  if (r.run) console.log(`      ${c.dim(r.run.url)}`)
  if (r.pages) console.log(`      ${c.dim(r.pages.url)}`)
}
console.log(
  `\n  ${problems ? c.red(`${problems} need attention`) : c.green('all healthy')}\n`
)

// Surface a hint to the routing table so an agent knows what to do next.
if (problems) {
  console.log(
    c.dim('  → triage with the ops-monitor skill / release-monitor agent.\n')
  )
}

process.exit(problems ? 1 : 0)
