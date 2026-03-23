import type { CapabilityVerdict } from '../capability/capability-types.js'
import type { BootstrapPlan } from '../planner/plan-types.js'
import type { ExecutionStep, SelectedExecutionPath } from './execution-types.js'

function guidedReason(stepId: string) {
  if (stepId === 'start-app') {
    return 'start-app requires managed execution and verification handling'
  }

  return `step ${stepId} requires user guidance`
}

export function selectExecutionPath(
  plan: BootstrapPlan,
  verdict: CapabilityVerdict
): SelectedExecutionPath {
  if (verdict.decision !== 'can-act') {
    return {
      steps: [],
      boundary: {
        kind: 'blocked',
        reason: `capability verdict is ${verdict.decision}`,
        nextAction: verdict.requiredUserAction
      }
    }
  }

  const steps: ExecutionStep[] = []

  for (const step of plan.steps) {
    if (step.status === 'skipped') {
      continue
    }

    if (step.status === 'blocked') {
      return {
        steps,
        boundary: {
          kind: 'blocked',
          stepId: step.id,
          reason: step.reason ?? `${step.id} is blocked`,
          nextAction: verdict.requiredUserAction
        }
      }
    }

    if (step.id === 'start-app') {
      steps.push({
        id: step.id,
        name: step.name,
        run: step.run,
        mode: 'guide',
        reason: guidedReason(step.id)
      })

      return {
        steps,
        boundary: {
          kind: 'guided',
          stepId: step.id,
          reason: guidedReason(step.id),
          nextAction: 'Run managed start-app verification or guide the user through this step.'
        }
      }
    }

    steps.push({
      id: step.id,
      name: step.name,
      run: step.run,
      mode: 'execute',
      reason: step.reason
    })
  }

  return {
    steps,
    boundary: {
      kind: 'none',
      reason: 'all selected proof-slice steps are executable'
    }
  }
}
