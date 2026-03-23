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

  it('reports trustworthy blocked outcomes for timeout or guided boundary stops', async () => {
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
          status: 'blocked',
          reason: 'verification timed out before success signal',
          nextAction: 'Fix startup or connectivity issues, then retry run.',
          logs: []
        }))
      }
    )

    expect(timeoutOutcome.status).toBe('blocked')
    expect(timeoutOutcome.nextAction).toContain('retry')

    const guidedOutcome = await runBootstrap(
      {
        repoRoot: '/tmp/proof-repo',
        plan: {
          steps: [{ id: 'install', name: 'Install', run: 'pnpm install', status: 'ready' }]
        },
        verdict: {
          decision: 'needs-user-action',
          nextStepId: null,
          checks: [],
          requiredUserAction: 'Install Node.js 20.x',
          caveats: []
        }
      },
      {
        runFiniteStep: vi.fn(async () => ({
          status: 'succeeded',
          exitCode: 0,
          stdout: 'ok',
          stderr: '',
          durationMs: 10
        }))
      }
    )

    expect(guidedOutcome.status).toBe('blocked')
    expect(guidedOutcome.reason).toContain('needs-user-action')
  })

  it('keeps reporting contract-bound without generic diagnostics expansion', () => {
    const rendered = renderRunOutcome({
      status: 'blocked',
      reason: 'verification timed out before success signal',
      nextAction: 'Fix startup or connectivity issues, then retry run.',
      executedStepIds: ['install', 'migrate'],
      guidedStepId: 'start-app',
      events: [
        {
          type: 'verification-failed',
          at: new Date().toISOString(),
          stepId: 'start-app',
          message: 'verification timed out before success signal'
        }
      ],
      caveats: []
    })

    expect(rendered).toContain('Status: blocked')
    expect(rendered).toContain('Guided step: start-app')
    expect(rendered).not.toContain('taxonomy')
    expect(rendered).not.toContain('deep diagnostics')
  })
})
