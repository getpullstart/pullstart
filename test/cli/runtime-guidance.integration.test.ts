import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { buildCapabilityVerdict } from '../../src/capability/build-capability-verdict.js'
import { renderCapabilityVerdict } from '../../src/capability/render-capability-verdict.js'
import { main as runMain } from '../../src/cli/run.js'
import { main as verdictMain } from '../../src/cli/verdict.js'
import { loadSetupSpec } from '../../src/contract/load-setup-spec.js'
import { runBootstrap } from '../../src/execute/run-bootstrap.js'
import { renderRunOutcome } from '../../src/execute/render-run-outcome.js'
import { inspectMachine } from '../../src/inspect/machine-inspector.js'
import { inspectRepo } from '../../src/inspect/repo-inspector.js'
import { inspectSession } from '../../src/inspect/session-inspector.js'
import { buildPlan } from '../../src/planner/build-plan.js'

const tempDirs: string[] = []

function createMisconfiguredProofRepo() {
  const dir = mkdtempSync(resolve(tmpdir(), 'pullstart-proof-'))
  tempDirs.push(dir)

  writeFileSync(
    resolve(dir, 'setup.spec.yaml'),
    `version: 0
repo:
  name: runtime-proof
  description: Runtime proof slice

tools:
  - name: node
    version: 20.x
    required: true
  - name: missing-proof-tool
    version: 1.x
    required: true
  - name: docker
    version: 24+
    required: false

services:
  - name: postgres
    kind: postgres
    required: true
    strategy: one_of
    options:
      - id: local-instance
        type: existing
        note: use local postgres
    healthcheck:
      type: tcp
      target: localhost:5432

env:
  required_files:
    - path: .env
      example: .env.example
  required_vars:
    - name: DATABASE_URL
      source: .env.example

steps:
  - id: install
    name: Install dependencies
    run: pnpm install
  - id: migrate
    name: Run database migrations
    run: pnpm db:migrate
  - id: start-app
    name: Start app
    run: pnpm dev

verify:
  - id: api-health
    name: Health endpoint responds
    type: http
    target: http://127.0.0.1:3000/health
    expect_status: 200
`
  )

  writeFileSync(
    resolve(dir, 'package.json'),
    JSON.stringify(
      {
        name: 'runtime-proof',
        private: true,
        scripts: {
          install: 'echo install',
          'db:migrate': 'echo migrate',
          dev: 'node app.js'
        }
      },
      null,
      2
    )
  )

  writeFileSync(resolve(dir, '.env.example'), 'DATABASE_URL=postgres://localhost/test\n')

  return dir
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { force: true, recursive: true })
  }
})

describe('runtime misconfiguration guidance clarity', () => {
  it('verdict and run summaries provide one clear next action with honest caveats when present', async () => {
    const repoDir = createMisconfiguredProofRepo()

    const verdictWrites: string[] = []

    await verdictMain(['--summary'], {
      cwd: () => repoDir,
      stdout: {
        write(chunk: string) {
          verdictWrites.push(chunk)
          return true
        }
      },
      loadSetupSpec,
      inspectRepo,
      inspectMachine,
      buildPlan,
      inspectSession,
      buildCapabilityVerdict,
      renderCapabilityVerdict
    })

    const verdictOutput = verdictWrites.join('')
    expect((verdictOutput.match(/^Next action:/gm) ?? []).length).toBe(1)
    expect(verdictOutput).toContain('unresolved-until-execution')
    expect(verdictOutput).toContain('unknown:auth:registry')

    if (verdictOutput.includes('Caveats:')) {
      expect(verdictOutput).toContain('Unknown:')
    }

    const runWrites: string[] = []

    await runMain(['--summary'], {
      cwd: () => repoDir,
      stdout: {
        write(chunk: string) {
          runWrites.push(chunk)
          return true
        }
      },
      loadSetupSpec,
      inspectRepo,
      inspectMachine,
      buildPlan,
      inspectSession,
      buildCapabilityVerdict,
      runBootstrap,
      renderRunOutcome
    })

    const runOutput = runWrites.join('')
    expect((runOutput.match(/^Next action:/gm) ?? []).length).toBe(1)

    if (runOutput.includes('Caveats:')) {
      expect(runOutput).toContain('Unknown:')
    }
  })
})
