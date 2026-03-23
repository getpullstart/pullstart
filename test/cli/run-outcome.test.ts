import { describe, expect, it, vi } from 'vitest'

import { renderRunOutcome } from '../../src/execute/render-run-outcome.js'
import { runBootstrap } from '../../src/execute/run-bootstrap.js'

describe('EXEC-02/EXEC-04 run outcome reporting', () => {
  it('reports explicit runnable success when finite path and managed verification pass', async () => {
    const outcome = await runBootstrap(
      {
        repoRoot: '/tmp/proof-repo',
        plan: {
          steps: [
            { id: 'install', name: 'Install', run: 'pnpm install', status: 'ready' },
            { id: 'migrate', name: 'Migrate', run: 'pnpm db:migrate', status: 'pending' },
            { id: 'start-app', name: 'Start app', run: 'pnpm dev', status: 'pending' }
          ]
        },
        verdict: {
          decision: 'can-act',
          nextStepId: 'install',
          checks: [],
          caveats: []
        },
        verification: {
          id: 'api-health',
          name: 'Health endpoint responds',
          type: 'http',
          target: 'http://localhost:3000/health',
          expect_status: 200
        }
      },
      {
        runFiniteStep: vi.fn(async () => ({
          status: 'succeeded',
          exitCode: 0,
          stdout: 'ok',
          stderr: '',
          durationMs: 10
        })),
        runManagedStartApp: vi.fn(async () => ({
          status: 'success',
          reason: 'verification target responded with expected status while app was managed',
          logs: []
        }))
      }
    )

    expect(outcome.status).toBe('success')
    const rendered = renderRunOutcome(outcome)
    expect(rendered).toContain('Status: success')
  })

  it('reports trustworthy blocked outcomes with one clear next action and caveats', async () => {
    const timeoutOutcome = await runBootstrap(
      {
        repoRoot: '/tmp/proof-repo',
        plan: {
          steps: [
            { id: 'install', name: 'Install', run: 'pnpm install', status: 'ready' },
            { id: 'start-app', name: 'Start app', run: 'pnpm dev', status: 'pending' }
          ]
        },
        verdict: {
          decision: 'can-act',
          nextStepId: 'install',
          checks: [],
          caveats: ['Auth certainty is unknown.']
        },
        verification: {
          id: 'api-health',
          name: 'Health endpoint responds',
          type: 'http',
          target: 'http://localhost:3000/health',
          expect_status: 200
        }
      },
      {
        runFiniteStep: vi.fn(async () => ({
          status: 'succeeded',
          exitCode: 0,
          stdout: 'ok',
          stderr: '',
          durationMs: 10
        })),
        runManagedStartApp: vi.fn(async () => ({
          status: 'blocked',
          reason: 'verification timed out before success signal',
          nextAction: 'Fix startup readiness and retry run.',
          logs: []
        }))
      }
    )

    expect(timeoutOutcome.status).toBe('blocked')
    expect(timeoutOutcome.nextAction).toBe('Fix startup readiness and retry run.')

    const rendered = renderRunOutcome(timeoutOutcome)
    expect(rendered).toContain('Category: verification')
    expect(rendered).toContain('Next action: Fix startup readiness and retry run.')
    expect(rendered).toContain('Unknown: Auth certainty is unknown')
    expect((rendered.match(/Next action:/g) ?? []).length).toBe(1)
  })

  it('keeps reporting contract-bound without generic diagnostics expansion', () => {
    const rendered = renderRunOutcome({
      status: 'blocked',
      reason: 'verification never reached expected status before timeout window',
      nextAction:
        'Ensure the app serves the declared verification target with the expected status, then retry run.',
      executedStepIds: ['install', 'migrate'],
      guidedStepId: 'start-app',
      events: [
        {
          type: 'verification-failed',
          at: new Date().toISOString(),
          stepId: 'start-app',
          message: 'verification never reached expected status before timeout window'
        }
      ],
      caveats: []
    })

    expect(rendered).toContain('Status: blocked')
    expect(rendered).toContain('Category: verification')
    expect(rendered).toContain('Guided step: start-app')
    expect(rendered).not.toContain('taxonomy')
    expect(rendered).not.toContain('deep diagnostics')
  })

  it('classifies non-verification blocked outcomes into machine/service/repo categories', () => {
    const machine = renderRunOutcome({
      status: 'blocked',
      reason: 'repo root is not writable',
      executedStepIds: [],
      events: [{ type: 'blocked', at: new Date().toISOString(), message: 'permission issue' }],
      caveats: []
    })
    expect(machine).toContain('Category: machine-prerequisite')

    const service = renderRunOutcome({
      status: 'blocked',
      reason: 'service postgres is not reachable',
      executedStepIds: [],
      events: [{ type: 'blocked', at: new Date().toISOString(), message: 'service issue' }],
      caveats: []
    })
    expect(service).toContain('Category: service-health')

    const repo = renderRunOutcome({
      status: 'blocked',
      reason: 'step migrate failed',
      executedStepIds: ['install'],
      events: [{ type: 'step-failed', at: new Date().toISOString(), message: 'step failed' }],
      caveats: []
    })
    expect(repo).toContain('Category: repo-setup')
  })
})
