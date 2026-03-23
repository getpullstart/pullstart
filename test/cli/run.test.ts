import { describe, expect, it, vi } from 'vitest'

import { main } from '../../src/cli/run.js'

describe('run CLI', () => {
  it('executes bounded run flow and records structured output', async () => {
    const writes: string[] = []

    const outcome = {
      status: 'blocked',
      reason: 'guided boundary reached',
      nextAction: 'run start-app with verification',
      executedStepIds: ['install', 'migrate'],
      guidedStepId: 'start-app',
      events: [],
      caveats: [],
      runtimeEvidence: [
        {
          id: 'fact:runtime:step:install:succeeded',
          source: 'runtime-observed',
          subject: 'step.install.result',
          state: 'satisfied',
          summary: 'step install completed',
          affectsStepIds: ['install']
        }
      ],
      factRefs: [
        {
          id: 'fact:repo:package-json',
          source: 'observed-repo',
          subject: 'repo.package-json',
          state: 'satisfied',
          summary: 'package.json exists',
          affectsStepIds: ['install']
        }
      ],
      unknownEvidence: [
        {
          id: 'unknown:auth:registry',
          source: 'inferred',
          scope: 'auth',
          state: 'unresolved-until-execution',
          rationale: 'auth unknown pre-execution',
          affectsStepIds: ['install']
        }
      ]
    }

    const runBootstrap = vi.fn(async () => outcome)

    await main(['--summary'], {
      cwd: () => '/tmp/proof-repo',
      stdout: {
        write(chunk: string) {
          writes.push(chunk)
          return true
        }
      },
      loadSetupSpec: vi.fn(() => ({
        absolutePath: '/tmp/proof-repo/setup.spec.yaml',
        spec: {
          verify: [
            {
              id: 'api-health',
              name: 'Health endpoint responds',
              type: 'http',
              target: 'http://localhost:3000/health',
              expect_status: 200
            }
          ]
        }
      })),
      inspectRepo: vi.fn(() => ({ repoInspection: true })),
      inspectMachine: vi.fn(async () => ({ machineInspection: true })),
      buildPlan: vi.fn(() => ({ blockers: [], selectedServiceOptions: [], satisfiedFacts: [], steps: [] })),
      inspectSession: vi.fn(() => ({
        repoRoot: '/tmp/proof-repo',
        permissions: { repoRootWritable: true },
        unknowns: ['auth', 'network'],
        blockers: []
      })),
      buildCapabilityVerdict: vi.fn(() => ({
        decision: 'can-act',
        nextStepId: 'install',
        checks: [],
        caveats: []
      })),
      runBootstrap,
      renderRunOutcome: vi.fn(() => 'rendered run outcome')
    } as never)

    expect(runBootstrap).toHaveBeenCalledTimes(1)
    expect(writes.join('')).toContain('"status": "blocked"')
    expect(writes.join('')).toContain('"runtimeEvidence"')
    expect(writes.join('')).toContain('"unknownEvidence"')
    expect(writes.join('')).toContain('rendered run outcome')
  })
})
