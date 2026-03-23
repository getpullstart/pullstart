import type { EvidenceContradiction, FactRecord, UnknownEvidence } from '../evidence/evidence-types.js'

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
  factRefs?: string[]
  contradictionRefs?: string[]
  affectsStepIds: string[]
  userAction?: string
  unknownState?: 'unresolved-until-execution'
}

export interface CapabilityVerdict {
  decision: CapabilityDecision
  nextStepId: string | null
  checks: CapabilityCheck[]
  requiredUserAction?: string
  caveats: string[]
  factRefs?: FactRecord[]
  contradictions?: EvidenceContradiction[]
  unknownEvidence?: UnknownEvidence[]
}

export interface SessionInspectionResult {
  repoRoot: string
  permissions: {
    repoRootWritable: boolean
  }
  unknowns: Array<'auth' | 'network'>
  unknownEvidence: UnknownEvidence[]
  facts: FactRecord[]
  blockers: string[]
}
