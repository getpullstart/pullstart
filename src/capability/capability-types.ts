export type CapabilityDecision = 'can-act' | 'needs-user-action' | 'must-pause'

export type CapabilityState = 'ready' | 'blocked' | 'unknown' | 'not-needed'

export type CapabilityDomain =
  | 'repo'
  | 'toolchain'
  | 'env'
  | 'service'
  | 'auth'
  | 'network'
  | 'permissions'

export interface CapabilityCheck {
  id: string
  domain: CapabilityDomain
  state: CapabilityState
  summary: string
  evidence: string[]
  affectsStepIds: string[]
  userAction?: string
}

export interface CapabilityVerdict {
  decision: CapabilityDecision
  nextStepId: string | null
  checks: CapabilityCheck[]
  requiredUserAction?: string
  caveats: string[]
}

export interface SessionInspectionResult {
  repoRoot: string
  permissions: {
    repoRootWritable: boolean
  }
  unknowns: Array<'auth' | 'network'>
  blockers: string[]
}
