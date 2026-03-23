export type BlockerCategory =
  | 'machine-prerequisite'
  | 'service-health'
  | 'repo-setup'
  | 'verification'
  | 'external-access'

export type ExternalAccessBlockerFamily =
  | 'auth-missing'
  | 'auth-usable-unknown'
  | 'network-unreachable'
  | 'vpn-required-or-unreachable'
  | 'private-registry-unreachable'
  | 'registry-permission-denied'
  | 'private-dependency-missing'

export interface ClassifiedBlocker {
  category: BlockerCategory
  family?: ExternalAccessBlockerFamily
  label: string
  nextAction: string
}
