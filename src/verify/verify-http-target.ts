import type { VerificationStep } from '../contract/setup-spec-types.js'

export interface HttpVerificationResult {
  status: 'success' | 'timeout' | 'network-error' | 'status-mismatch'
  attempts: number
  lastStatus?: number
  error?: string
  durationMs: number
}

interface VerifyHttpTargetOptions {
  fetchImpl?: typeof fetch
  timeoutMs?: number
  intervalMs?: number
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function verifyHttpTarget(
  target: VerificationStep,
  options: VerifyHttpTargetOptions = {}
): Promise<HttpVerificationResult> {
  const fetchImpl = options.fetchImpl ?? fetch
  const timeoutMs = options.timeoutMs ?? 10_000
  const intervalMs = options.intervalMs ?? 250
  const start = Date.now()
  let attempts = 0
  let lastStatus: number | undefined
  let lastError: string | undefined
  let sawStatusMismatch = false

  while (Date.now() - start < timeoutMs) {
    attempts += 1
    try {
      const response = await fetchImpl(target.target)
      lastStatus = response.status

      if (response.status === target.expect_status) {
        return {
          status: 'success',
          attempts,
          lastStatus,
          durationMs: Date.now() - start
        }
      }

      sawStatusMismatch = true
      lastError = `expected ${target.expect_status}, got ${response.status}`
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }

    await wait(intervalMs)
  }

  if (lastError && attempts > 0 && lastStatus === undefined) {
    return {
      status: 'network-error',
      attempts,
      error: lastError,
      durationMs: Date.now() - start
    }
  }

  if (sawStatusMismatch) {
    return {
      status: 'status-mismatch',
      attempts,
      lastStatus,
      error: lastError,
      durationMs: Date.now() - start
    }
  }

  return {
    status: 'timeout',
    attempts,
    lastStatus,
    error: lastError,
    durationMs: Date.now() - start
  }
}
