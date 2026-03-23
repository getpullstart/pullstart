import type { CapabilityVerdict } from '../capability/capability-types.js'
import type { EvidenceContradiction, FactRecord, UnknownEvidence } from '../evidence/evidence-types.js'

export type ExecutionMode = 'execute' | 'guide'

export interface ExecutionStep {
  id: string
  name: string
  run: string
  mode: ExecutionMode
  reason?: string
}

export interface ExecutionBoundary {
  kind: 'none' | 'guided' | 'blocked'
  stepId?: string
  reason: string
  nextAction?: string
}

export interface SelectedExecutionPath {
  steps: ExecutionStep[]
  boundary: ExecutionBoundary
}

export type ExecutionEventType =
  | 'step-start'
  | 'step-success'
  | 'step-failed'
  | 'step-guided'
  | 'verification-success'
  | 'verification-failed'
  | 'blocked'

export interface ExecutionEvent {
  type: ExecutionEventType
  at: string
  stepId?: string
  message: string
  details?: Record<string, unknown>
}

export interface CommandResult {
  status: 'succeeded' | 'failed' | 'aborted'
  exitCode: number | null
  stdout: string
  stderr: string
  durationMs: number
}

export interface RunOutcome {
  status: 'success' | 'blocked'
  reason: string
  nextAction?: string
  executedStepIds: string[]
  guidedStepId?: string
  events: ExecutionEvent[]
  caveats: string[]
   factRefs?: FactRecord[]
   contradictions?: EvidenceContradiction[]
   unknownEvidence?: UnknownEvidence[]
   runtimeEvidence: FactRecord[]
}

export interface RunBootstrapInput {
  repoRoot: string
  plan: {
    steps: Array<{
      id: string
      name: string
      run: string
      status: 'ready' | 'pending' | 'blocked' | 'skipped'
      reason?: string
    }>
  }
  verdict: CapabilityVerdict
  verification?: {
    id: string
    name: string
    type: 'http'
    target: string
    expect_status: number
  }
}

export interface ManagedStartAppResult {
  status: 'success' | 'blocked'
  reason: string
  nextAction?: string
  logs: string[]
  details?: Record<string, unknown>
  runtimeEvidence?: FactRecord[]
}
