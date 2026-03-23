import { spawn } from 'node:child_process'

import type { VerificationStep } from '../contract/setup-spec-types.js'
import type { FactRecord } from '../evidence/evidence-types.js'
import { verifyHttpTarget } from '../verify/verify-http-target.js'
import type { ManagedStartAppResult } from './execution-types.js'

interface ManagedProcess {
  pid?: number
  stdout?: NodeJS.ReadableStream | null
  stderr?: NodeJS.ReadableStream | null
  once(event: 'exit', listener: (code: number | null, signal: NodeJS.Signals | null) => void): this
  once(event: 'error', listener: (error: Error) => void): this
  kill(signal?: NodeJS.Signals | number): boolean
}

interface RunManagedStartAppOptions {
  startProcess?: (command: string, args: string[], cwd: string) => ManagedProcess
  verifyHttpTarget?: typeof verifyHttpTarget
  fetchImpl?: typeof fetch
  verificationTimeoutMs?: number
  verificationIntervalMs?: number
}

function keepRecentLines(lines: string[], chunk: string, max = 40) {
  for (const line of chunk.split(/\r?\n/).filter(Boolean)) {
    lines.push(line)
  }

  if (lines.length > max) {
    lines.splice(0, lines.length - max)
  }
}

function mapBlockedResult(result: Awaited<ReturnType<typeof verifyHttpTarget>>) {
  if (result.status === 'status-mismatch') {
    return {
      reason: 'verification never reached expected status before timeout window',
      nextAction:
        'Ensure the app serves the declared verification target with the expected status, then retry run.'
    }
  }

  if (result.status === 'timeout') {
    return {
      reason: 'verification timed out before success signal',
      nextAction: 'Fix startup readiness and retry run.'
    }
  }

  return {
    reason: 'verification failed due to network errors',
    nextAction: 'Fix connectivity to the declared verification target and retry run.'
  }
}

function makeRuntimeEvidence(
  verification: VerificationStep,
  subjectSuffix: string,
  state: FactRecord['state'],
  summary: string
): FactRecord {
  return {
    id: `fact:runtime:verification:${verification.id}:${subjectSuffix}`,
    source: 'runtime-observed',
    subject: `verification.${verification.id}.${subjectSuffix}`,
    state,
    summary,
    affectsStepIds: ['start-app']
  }
}

export async function runManagedStartApp(
  repoRoot: string,
  stepCommand: string,
  verification: VerificationStep,
  options: RunManagedStartAppOptions = {}
): Promise<ManagedStartAppResult> {
  const verify = options.verifyHttpTarget ?? verifyHttpTarget
  const timeoutMs = options.verificationTimeoutMs ?? 10_000
  const intervalMs = options.verificationIntervalMs ?? 250

  const preflight = await verify(verification, {
    fetchImpl: options.fetchImpl,
    timeoutMs: 200,
    intervalMs: 200
  })

  if (preflight.status === 'success') {
    const runtimeEvidence = [
      makeRuntimeEvidence(
        verification,
        'preflight',
        'satisfied',
        'verification target already healthy before managed startup'
      )
    ]

    return {
      status: 'blocked',
      reason: 'verification target was already healthy before start-app; state is ambiguous',
      nextAction:
        'Stop any existing process on the verification target and rerun to prove this repository startup path.',
      logs: [],
      details: {
        attempts: preflight.attempts,
        lastStatus: preflight.lastStatus
      },
      runtimeEvidence
    }
  }

  const [command, ...args] = stepCommand.split(/\s+/)
  const startProcess =
    options.startProcess ??
    ((cmd, argv, cwd) => spawn(cmd, argv, { cwd, stdio: ['ignore', 'pipe', 'pipe'] }))
  const processRef = startProcess(command, args, repoRoot)
  const logs: string[] = []
  let terminated = false

  processRef.stdout?.on('data', (chunk) => {
    keepRecentLines(logs, String(chunk))
  })

  processRef.stderr?.on('data', (chunk) => {
    keepRecentLines(logs, String(chunk))
  })

  const processExit = new Promise<
    | {
        kind: 'exit'
        code: number | null
        signal: NodeJS.Signals | null
      }
    | {
        kind: 'error'
        error: Error
      }
  >((resolve) => {
    processRef.once('exit', (code, signal) => {
      resolve({ kind: 'exit', code, signal })
    })
    processRef.once('error', (error) => {
      resolve({ kind: 'error', error })
    })
  })

  const verificationPromise = verify(verification, {
    fetchImpl: options.fetchImpl,
    timeoutMs,
    intervalMs
  })

  const winner = await Promise.race([
    processExit.then((result) => ({ type: 'process' as const, result })),
    verificationPromise.then((result) => ({ type: 'verification' as const, result }))
  ])

  const terminate = () => {
    if (!terminated) {
      processRef.kill('SIGTERM')
      terminated = true
    }
  }

  if (winner.type === 'process') {
    terminate()

    if (winner.result.kind === 'error') {
      return {
        status: 'blocked',
        reason: `start-app failed before verification: ${winner.result.error.message}`,
        nextAction: 'Fix start-app command errors and retry run.',
        logs,
        runtimeEvidence: [
          {
            id: `fact:runtime:start-app:${verification.id}:process-error`,
            source: 'runtime-observed',
            subject: `start-app.${verification.id}.process-error`,
            state: 'missing',
            summary: winner.result.error.message,
            affectsStepIds: ['start-app']
          }
        ]
      }
    }

    return {
      status: 'blocked',
      reason: `start-app exited before verification (code: ${winner.result.code ?? 'null'})`,
      nextAction: 'Inspect startup logs, resolve app exit cause, and retry run.',
      logs,
      runtimeEvidence: [
        {
          id: `fact:runtime:start-app:${verification.id}:process-exit`,
          source: 'runtime-observed',
          subject: `start-app.${verification.id}.process-exit`,
          state: 'missing',
          summary: `start-app exited before verification (code: ${winner.result.code ?? 'null'})`,
          affectsStepIds: ['start-app']
        }
      ]
    }
  }

  terminate()

  if (winner.result.status === 'success') {
    const runtimeEvidence = [
      makeRuntimeEvidence(
        verification,
        'result',
        'satisfied',
        'verification target reached expected status while app was managed'
      )
    ]
    return {
      status: 'success',
      reason: 'verification target responded with expected status while app was managed',
      logs,
      details: {
        attempts: winner.result.attempts,
        durationMs: winner.result.durationMs,
        verificationTarget: verification.target,
        expectStatus: verification.expect_status
      },
      runtimeEvidence
    }
  }

  const mapped = mapBlockedResult(winner.result)

  return {
    status: 'blocked',
    reason: mapped.reason,
    nextAction: mapped.nextAction,
    logs,
    details: {
      attempts: winner.result.attempts,
      lastStatus: winner.result.lastStatus,
      error: winner.result.error,
      verificationTarget: verification.target,
      expectStatus: verification.expect_status,
      resultState: winner.result.status
    },
    runtimeEvidence: [
      makeRuntimeEvidence(
        verification,
        'result',
        winner.result.status === 'network-error' ? 'unknown' : 'missing',
        mapped.reason
      )
    ]
  }
}
