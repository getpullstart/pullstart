import { describe, expect, it, vi } from 'vitest'

import { verifyHttpTarget } from '../../src/verify/verify-http-target.js'

const target = {
  id: 'api-health',
  name: 'Health endpoint responds',
  type: 'http' as const,
  target: 'http://localhost:3000/health',
  expect_status: 200
}

describe('EXEC-02 verifyHttpTarget', () => {
  it('succeeds when expected status is observed within timeout', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ status: 503 })
      .mockResolvedValueOnce({ status: 200 })

    const result = await verifyHttpTarget(target, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      timeoutMs: 500,
      intervalMs: 1
    })

    expect(result.status).toBe('success')
    expect(result.attempts).toBe(2)
    expect(result.lastStatus).toBe(200)
  })

  it('times out when expected status never appears', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ status: 503 })

    const result = await verifyHttpTarget(target, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      timeoutMs: 10,
      intervalMs: 1
    })

    expect(result.status).toBe('timeout')
  })

  it('returns network-error when all polling attempts throw', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('connection refused')
    })

    const result = await verifyHttpTarget(target, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      timeoutMs: 10,
      intervalMs: 1
    })

    expect(result.status).toBe('network-error')
    expect(result.error).toContain('connection refused')
  })
})
