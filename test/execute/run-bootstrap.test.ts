import { describe, expect, it, vi } from 'vitest'

import { runBootstrap } from '../../src/execute/run-bootstrap.js'
import type { RunBootstrapInput } from '../../src/execute/execution-types.js'

const input: RunBootstrapInput = {
  repoRoot: '/tmp/proof-repo',
  plan: {
    steps: [
      { id: 'install', name: 'Install dependencies', run: 'pnpm install', status: 'ready' },
      {
        id: 'start-postgres',
        name: 'Start PostgreSQL',
        run: 'docker compose up -d postgres',
        status: 'pending'
      },
      { id: 'migrate', name: 'Run migrations', run: 'pnpm db:migrate', status: 'pending' },
      { id: 'start-app', name: 'Start app', run: 'pnpm dev', status: 'pending' }
    ]
  },
  verdict: {
    decision: 'can-act',
    nextStepId: 'install',
    checks: [],
    caveats: ['network reachability for install is unknown']
  },
  verification: {
    id: 'api-health',
    name: 'Health endpoint responds',
    type: 'http',
    target: 'http://localhost:3000/health',
    expect_status: 200
  }
}

describe('EXEC-01/EXEC-03 runBootstrap', () => {
  it('executes finite steps in order and records visible events', async () => {
    const runFiniteStep = vi.fn(async () => ({
      status: 'succeeded' as const,
      exitCode: 0,
      stdout: 'ok',
      stderr: '',
      durationMs: 10
    }))

    const outcome = await runBootstrap(input, {
      runFiniteStep,
      runManagedStartApp: vi.fn(async () => ({
        status: 'success',
        reason: 'verified',
        logs: []
      }))
    })

    expect(runFiniteStep).toHaveBeenCalledTimes(3)
    expect(outcome.status).toBe('success')
    expect(outcome.executedStepIds).toEqual(['install', 'start-postgres', 'migrate'])
    expect(outcome.events.map((item) => item.type)).toEqual(
      expect.arrayContaining(['step-start', 'step-success', 'step-guided'])
    )
  })

  it('stops immediately with blocked outcome when a finite step fails', async () => {
    const runFiniteStep = vi
      .fn()
      .mockResolvedValueOnce({
        status: 'succeeded' as const,
        exitCode: 0,
        stdout: 'ok',
        stderr: '',
        durationMs: 10
      })
      .mockResolvedValueOnce({
        status: 'failed' as const,
        exitCode: 1,
        stdout: '',
        stderr: 'boom',
        durationMs: 10
      })

    const outcome = await runBootstrap(input, {
      runFiniteStep,
      runManagedStartApp: vi.fn(async () => ({
        status: 'success',
        reason: 'verified',
        logs: []
      }))
    })

    expect(outcome.status).toBe('blocked')
    expect(outcome.reason).toContain('failed')
    expect(outcome.executedStepIds).toEqual(['install'])
  })

  it('maps managed verification blocked states into deterministic blocked outcomes', async () => {
    const runFiniteStep = vi.fn(async () => ({
      status: 'succeeded' as const,
      exitCode: 0,
      stdout: 'ok',
      stderr: '',
      durationMs: 10
    }))

    const outcome = await runBootstrap(input, {
      runFiniteStep,
      runManagedStartApp: vi.fn(async () => ({
        status: 'blocked',
        reason: 'verification never reached expected status before timeout window',
        nextAction:
          'Ensure the app serves the declared verification target with the expected status, then retry run.',
        logs: []
      }))
    })

    expect(outcome.status).toBe('blocked')
    expect(outcome.reason).toContain('never reached expected status')
    expect(outcome.nextAction).toContain('expected status')
    expect(outcome.events.some((event) => event.type === 'verification-failed')).toBe(true)
    const verificationEvent = outcome.events.find((event) => event.type === 'verification-failed')
    expect(verificationEvent?.details?.nextAction).toContain('expected status')
  })
})
