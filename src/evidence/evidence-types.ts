export const FACT_SOURCES = [
  'declared',
  'observed-repo',
  'observed-machine',
  'runtime-observed',
  'inferred'
] as const

export type FactSource = (typeof FACT_SOURCES)[number]

export type FactState =
  | 'satisfied'
  | 'missing'
  | 'unknown'
  | 'contradicted'
  | 'unresolved-until-execution'

export interface FactRecord {
  id: string
  source: FactSource
  subject: string
  state: FactState
  summary: string
  affectsStepIds: string[]
}

export interface UnknownEvidence {
  id: string
  source: Extract<FactSource, 'inferred' | 'runtime-observed'>
  scope: 'auth' | 'network'
  state: 'unresolved-until-execution'
  rationale: string
  affectsStepIds: string[]
}

export interface EvidenceContradiction {
  id: string
  declaredFactId: string
  observedFactId: string
  summary: string
  affectsStepIds: string[]
}
