import { EventEmitter } from 'node:events'

import { describe, expect, it, vi } from 'vitest'

import { runManagedStartApp } from '../../src/execute/run-managed-start-app.js'

function createFakeProcess() {
  const events = new EventEmitter()

  return {
    pid: 12345,
    stdout: null,
    stderr: null,
    once(event: 'exit' | 'error', listener: (...args: unknown[]) => void) {
      events.once(event, listener)
      return this
    },
    kill: vi.fn(() => {
      events.emit('exit', 0, 'SIGTERM')
      return true
    }),
    emitExit(code: number | null, signal: NodeJS.Signals | null = null) {
      events.emit('exit', code, signal)
    },
    emitError(error: Error) {
      events.emit('error', error)
    }
  }
}

const verification = {
  id: 'api-health',
  name: 'Health endpoint responds',
  type: 'http' as const,
  target: 'http://localhost:3000/health',
  expect_status: 200
}

describe('EXEC-04 runManagedStartApp', () => {
  it('returns ambiguous blocked state when target is healthy before startup', async () => {
    const result = await runManagedStartApp('/tmp/proof-repo', 'pnpm dev', verification, {
      verifyHttpTarget: vi.fn().mockResolvedValueOnce({ status: 'success', attempts: 1, durationMs: 10 })
    })

    expect(result.status).toBe('blocked')
    expect(result.reason).toContain('already healthy')
    expect(result.nextAction).toContain('rerun')
    expect(result.runtimeEvidence?.[0]?.source).toBe('runtime-observed')
    expect(result.runtimeEvidence?.[0]?.state).toBe('satisfied')
    expect(result.runtimeEvidence?.[0]?.subject).toContain('.preflight')
  })

  it('terminates managed app process on verification success', async () => {
    const processRef = createFakeProcess()
    const verify = vi
      .fn()
      .mockResolvedValueOnce({ status: 'timeout', attempts: 1, durationMs: 10 })
      .mockResolvedValueOnce({ status: 'success', attempts: 2, durationMs: 20 })

    const result = await runManagedStartApp('/tmp/proof-repo', 'pnpm dev', verification, {
      verifyHttpTarget: verify,
      startProcess: () => processRef
    })

    expect(result.status).toBe('success')
    expect(processRef.kill).toHaveBeenCalled()
    expect(result.runtimeEvidence?.some((item) => item.source === 'runtime-observed')).toBe(true)
  })

  it('returns deterministic blocked guidance on status mismatch', async () => {
    const processRef = createFakeProcess()
    const verify = vi
      .fn()
      .mockResolvedValueOnce({ status: 'timeout', attempts: 1, durationMs: 10 })
      .mockResolvedValueOnce({
        status: 'status-mismatch',
        attempts: 3,
        lastStatus: 503,
        error: 'expected 200, got 503',
        durationMs: 50
      })

    const result = await runManagedStartApp('/tmp/proof-repo', 'pnpm dev', verification, {
      verifyHttpTarget: verify,
      startProcess: () => processRef
    })

    expect(result.status).toBe('blocked')
    expect(result.reason).toContain('never reached expected status')
    expect(result.nextAction).toContain('expected status')
    expect(processRef.kill).toHaveBeenCalled()
    expect(result.runtimeEvidence?.some((item) => item.source === 'runtime-observed')).toBe(true)
  })
})
