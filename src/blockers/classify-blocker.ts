import type { PlanBlocker } from '../planner/plan-types.js'
import type { ClassifiedBlocker } from './blocker-types.js'

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
    return {
      category: 'repo-setup',
      label: 'Repo setup',
      nextAction: input.nextAction ?? 'Fix the failing step and rerun Pullstart.'
    }
  }

  const byReason = runtimeFromReason(input.reason)
  return {
    ...byReason,
    nextAction: input.nextAction ?? byReason.nextAction
  }
}
