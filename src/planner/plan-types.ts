export type PlanStatus = 'ready' | 'pending' | 'blocked' | 'skipped'

export interface PlanBlocker {
  id: string
  scope: 'repo' | 'tool' | 'env-file' | 'env-var' | 'service'
  message: string
  stepIds: string[]
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
  steps: PlannedStep[]
}
