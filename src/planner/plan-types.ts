export type PlanStatus = 'ready' | 'pending' | 'blocked' | 'skipped'

import type { EvidenceContradiction, FactRecord } from '../evidence/evidence-types.js'

export interface PlanFactRef {
  id: string
  source: FactRecord['source']
  subject: string
  state: FactRecord['state']
  summary: string
  affectsStepIds: string[]
}

export interface PlanBlocker {
  id: string
  scope: 'repo' | 'tool' | 'env-file' | 'env-var' | 'service'
  message: string
  stepIds: string[]
  factRefs?: PlanFactRef[]
  contradictionRefs?: string[]
}

export interface SelectedServiceOption {
  serviceName: string
  optionId: string
  reason: string
}

export interface PlannedStep {
  id: string
  name: string
  run: string
  status: PlanStatus
  dependsOn: string[]
  reason?: string
}

export interface BootstrapPlan {
  blockers: PlanBlocker[]
  selectedServiceOptions: SelectedServiceOption[]
  satisfiedFacts: string[]
  satisfiedFactRefs?: PlanFactRef[]
  factRefs?: FactRecord[]
  contradictions?: EvidenceContradiction[]
  steps: PlannedStep[]
}
