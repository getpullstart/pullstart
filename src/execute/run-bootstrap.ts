import type { BootstrapPlan } from '../planner/plan-types.js'
import { selectExecutionPath } from './select-execution-path.js'
import type {
  CommandResult,
  ExecutionEvent,
  ManagedStartAppResult,
  RunBootstrapInput,
  RunOutcome
} from './execution-types.js'
import { runFiniteStep } from './run-finite-step.js'
import { runManagedStartApp } from './run-managed-start-app.js'

interface RunBootstrapOptions {
  selectExecutionPath?: typeof selectExecutionPath
  runFiniteStep?: (
    repoRoot: string,
    step: { id: string; name: string; run: string },
    options?: object
  ) => Promise<CommandResult>
  runManagedStartApp?: (
    repoRoot: string,
    stepCommand: string,
    verification: {
      id: string
      name: string
      type: 'http'
      target: string
      expect_status: number
    },
    options?: object
  ) => Promise<ManagedStartAppResult>
}

function nowIso() {
  return new Date().toISOString()
}

function event(
  type: ExecutionEvent['type'],
  message: string,
  stepId?: string,
  details?: Record<string, unknown>
): ExecutionEvent {
  return {
    type,
    at: nowIso(),
    stepId,
    message,
    details
  }
}

export async function runBootstrap(
  input: RunBootstrapInput,
  options: RunBootstrapOptions = {}
): Promise<RunOutcome> {
  const pickPath = options.selectExecutionPath ?? selectExecutionPath
  const runStep = options.runFiniteStep ?? runFiniteStep
  const runManaged = options.runManagedStartApp ?? runManagedStartApp

  const selectedPath = pickPath(input.plan as BootstrapPlan, input.verdict)
  const events: ExecutionEvent[] = []
  const executedStepIds: string[] = []
  const caveats = [...input.verdict.caveats]

  if (selectedPath.boundary.kind === 'blocked' && selectedPath.steps.length === 0) {
    events.push(
      event('blocked', selectedPath.boundary.reason, selectedPath.boundary.stepId, {
        nextAction: selectedPath.boundary.nextAction
      })
    )

    return {
      status: 'blocked',
      reason: selectedPath.boundary.reason,
      nextAction: selectedPath.boundary.nextAction,
      executedStepIds,
      events,
      caveats
    }
  }

  for (const step of selectedPath.steps.filter((candidate) => candidate.mode === 'execute')) {
    events.push(event('step-start', `Running ${step.id}`, step.id, { run: step.run }))

    const result = await runStep(input.repoRoot, step)

    if (result.status !== 'succeeded') {
      events.push(
        event('step-failed', `Step ${step.id} failed`, step.id, {
          status: result.status,
          exitCode: result.exitCode,
          stderr: result.stderr,
          nextAction: 'Fix the failing step and rerun Pullstart.'
        })
      )

      return {
        status: 'blocked',
        reason: `step ${step.id} failed`,
        nextAction: 'Fix the failing step and rerun Pullstart.',
        executedStepIds,
        events,
        caveats
      }
    }

    executedStepIds.push(step.id)
    events.push(
      event('step-success', `Step ${step.id} completed`, step.id, {
        exitCode: result.exitCode,
        durationMs: result.durationMs
      })
    )
  }

  if (selectedPath.boundary.kind === 'guided' && selectedPath.boundary.stepId) {
    const guidedStep = selectedPath.steps.find((step) => step.id === selectedPath.boundary.stepId)

    events.push(
      event('step-guided', selectedPath.boundary.reason, selectedPath.boundary.stepId, {
        nextAction: selectedPath.boundary.nextAction
      })
    )

    if (guidedStep?.id === 'start-app' && input.verification) {
      const managed = await runManaged(input.repoRoot, guidedStep.run, input.verification)

      if (managed.status === 'success') {
        events.push(
          event('verification-success', managed.reason, guidedStep.id, {
            logs: managed.logs,
            ...managed.details
          })
        )

        return {
          status: 'success',
          reason: managed.reason,
          executedStepIds,
          guidedStepId: guidedStep.id,
          events,
          caveats
        }
      }

      events.push(
        event('verification-failed', managed.reason, guidedStep.id, {
          logs: managed.logs,
          ...managed.details,
          nextAction: managed.nextAction
        })
      )

      return {
        status: 'blocked',
        reason: managed.reason,
        nextAction: managed.nextAction,
        executedStepIds,
        guidedStepId: guidedStep.id,
        events,
        caveats
      }
    }

    return {
      status: 'blocked',
      reason: selectedPath.boundary.reason,
      nextAction: selectedPath.boundary.nextAction,
      executedStepIds,
      guidedStepId: selectedPath.boundary.stepId,
      events,
      caveats
    }
  }

  return {
    status: 'success',
    reason: 'finite execution path completed without guided boundaries',
    executedStepIds,
    events,
    caveats
  }
}
