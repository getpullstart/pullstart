import type { PlanBlocker } from '../planner/plan-types.js'
import type { ClassifiedBlocker, ExternalAccessBlockerFamily } from './blocker-types.js'

function classifyToolLike(scope: PlanBlocker['scope']): ClassifiedBlocker | null {
  if (scope === 'tool') {
    return {
      category: 'machine-prerequisite',
      label: 'Machine prerequisite',
      nextAction: 'Install or fix the required tool version, then rerun Pullstart.'
    }
  }

  if (scope === 'env-file' || scope === 'env-var') {
    return {
      category: 'machine-prerequisite',
      label: 'Machine prerequisite',
      nextAction: 'Provide the required environment configuration and rerun Pullstart.'
    }
  }

  return null
}

function normalizeValue(value: unknown): string {
  if (typeof value === 'string') {
    return value.toLowerCase()
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item)).join(' ')
  }

  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map((item) => normalizeValue(item))
      .join(' ')
  }

  return ''
}

function classifyExternalFamilyFromText(text: string): ExternalAccessBlockerFamily | null {
  const normalized = text.toLowerCase()

  if (
    normalized.includes('permission denied') ||
    normalized.includes('e403') ||
    (normalized.includes('forbidden') && normalized.includes('registry'))
  ) {
    return 'registry-permission-denied'
  }

  if (
    normalized.includes('private dependency') ||
    normalized.includes('private-dependency') ||
    normalized.includes('no matching version found') ||
    normalized.includes('cannot find package') ||
    normalized.includes('module not found')
  ) {
    return 'private-dependency-missing'
  }

  if (normalized.includes('vpn')) {
    return 'vpn-required-or-unreachable'
  }

  if (
    normalized.includes('private registry') &&
    (normalized.includes('unreachable') ||
      normalized.includes('timed out') ||
      normalized.includes('timeout') ||
      normalized.includes('enotfound') ||
      normalized.includes('econnrefused') ||
      normalized.includes('network'))
  ) {
    return 'private-registry-unreachable'
  }

  if (
    normalized.includes('network') ||
    normalized.includes('enotfound') ||
    normalized.includes('econnrefused') ||
    normalized.includes('timed out') ||
    normalized.includes('timeout')
  ) {
    return 'network-unreachable'
  }

  if (
    (normalized.includes('auth') || normalized.includes('token') || normalized.includes('credential')) &&
    (normalized.includes('missing') || normalized.includes('not set') || normalized.includes('not provided'))
  ) {
    return 'auth-missing'
  }

  if (
    normalized.includes('auth usability') ||
    normalized.includes('unknown auth') ||
    normalized.includes('unresolved until execution') ||
    normalized.includes('unknown')
  ) {
    return 'auth-usable-unknown'
  }

  return null
}

function externalBlocker(family: ExternalAccessBlockerFamily): ClassifiedBlocker {
  const actionByFamily: Record<ExternalAccessBlockerFamily, string> = {
    'auth-missing': 'Provide required registry credentials, then rerun Pullstart.',
    'auth-usable-unknown': 'Run the failing install step once to confirm auth usability, then rerun Pullstart.',
    'network-unreachable': 'Restore network reachability to required package hosts, then rerun Pullstart.',
    'vpn-required-or-unreachable': 'Connect to required VPN/private network, then rerun Pullstart.',
    'private-registry-unreachable': 'Restore private registry reachability, then rerun Pullstart.',
    'registry-permission-denied':
      'Resolve registry permission/auth access for requested package, then rerun Pullstart.',
    'private-dependency-missing':
      'Publish or grant access to the missing private dependency, then rerun Pullstart.'
  }

  return {
    category: 'external-access',
    family,
    label: 'External access',
    nextAction: actionByFamily[family]
  }
}

function classifyPlannerExternal(blocker: PlanBlocker): ClassifiedBlocker | null {
  const fromId = classifyExternalFamilyFromText(blocker.id)
  if (fromId) {
    return externalBlocker(fromId)
  }

  const fromMessage = classifyExternalFamilyFromText(blocker.message)
  if (fromMessage) {
    return externalBlocker(fromMessage)
  }

  return null
}

export function classifyPlannerBlocker(blocker: PlanBlocker): ClassifiedBlocker {
  if (blocker.contradictionRefs && blocker.contradictionRefs.length > 0) {
    return {
      category: 'repo-setup',
      label: 'Repo setup',
      nextAction:
        'Resolve declared-versus-observed contradiction evidence before continuing and rerun Pullstart.'
    }
  }

  const toolLike = classifyToolLike(blocker.scope)
  if (toolLike) {
    return toolLike
  }

  const external = classifyPlannerExternal(blocker)
  if (external) {
    return external
  }

  if (blocker.scope === 'service') {
    return {
      category: 'service-health',
      label: 'Service health',
      nextAction: 'Start or repair the required service and rerun Pullstart.'
    }
  }

  return {
    category: 'repo-setup',
    label: 'Repo setup',
    nextAction: 'Fix the repository setup blocker and rerun Pullstart.'
  }
}

interface RuntimeClassificationInput {
  reason: string
  nextAction?: string
  eventType?: 'verification-failed' | 'step-failed' | 'blocked'
  details?: Record<string, unknown>
}

function runtimeFromReason(reason: string): ClassifiedBlocker {
  const normalized = reason.toLowerCase()

  if (
    normalized.includes('service') ||
    normalized.includes('postgres') ||
    normalized.includes('connectivity')
  ) {
    return {
      category: 'service-health',
      label: 'Service health',
      nextAction: 'Start or repair the required service and rerun Pullstart.'
    }
  }

  if (
    normalized.includes('tool') ||
    normalized.includes('env file') ||
    normalized.includes('env var') ||
    normalized.includes('permission') ||
    normalized.includes('writable')
  ) {
    return {
      category: 'machine-prerequisite',
      label: 'Machine prerequisite',
      nextAction: 'Fix the local prerequisite and rerun Pullstart.'
    }
  }

  return {
    category: 'repo-setup',
    label: 'Repo setup',
    nextAction: 'Fix the repository setup blocker and rerun Pullstart.'
  }
}

function classifyRuntimeExternal(input: RuntimeClassificationInput): ClassifiedBlocker | null {
  const detailsText = normalizeValue(input.details)
  const familyFromDetails = classifyExternalFamilyFromText(detailsText)
  if (familyFromDetails) {
    return externalBlocker(familyFromDetails)
  }

  const familyFromReason = classifyExternalFamilyFromText(input.reason)
  if (familyFromReason) {
    return externalBlocker(familyFromReason)
  }

  return null
}

export function classifyRuntimeBlocker(input: RuntimeClassificationInput): ClassifiedBlocker {
  const resultState = input.details?.resultState

  // Verification precedence must override generic blocked labels.
  if (
    input.eventType === 'verification-failed' ||
    resultState === 'status-mismatch' ||
    resultState === 'timeout' ||
    resultState === 'network-error'
  ) {
    return {
      category: 'verification',
      label: 'Verification',
      nextAction:
        input.nextAction ??
        'Fix the verification target behavior and rerun Pullstart.'
    }
  }

  if (input.eventType === 'step-failed') {
    const external = classifyRuntimeExternal(input)
    if (external) {
      return {
        ...external,
        nextAction: input.nextAction ?? external.nextAction
      }
    }

    return {
      category: 'repo-setup',
      label: 'Repo setup',
      nextAction: input.nextAction ?? 'Fix the failing step and rerun Pullstart.'
    }
  }

  const external = classifyRuntimeExternal(input)
  if (external) {
    return {
      ...external,
      nextAction: input.nextAction ?? external.nextAction
    }
  }

  const byReason = runtimeFromReason(input.reason)
  return {
    ...byReason,
    nextAction: input.nextAction ?? byReason.nextAction
  }
}
