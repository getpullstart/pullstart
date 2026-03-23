export type BlockerCategory =
  | 'machine-prerequisite'
  | 'service-health'
  | 'repo-setup'
  | 'verification'

export interface ClassifiedBlocker {
  category: BlockerCategory
  label: string
  nextAction: string
}

