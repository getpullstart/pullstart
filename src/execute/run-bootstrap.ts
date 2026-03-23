import type { BootstrapPlan } from '../planner/plan-types.js'
import type { FactRecord } from '../evidence/evidence-types.js'
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

function runtimeEvidenceFact(
  id: string,
  subject: string,
  state: FactRecord['state'],
  summary: string,
  affectsStepIds: string[]
): FactRecord {
  return {
    id,
    source: 'runtime-observed',
    subject,
    state,
    summary,
    affectsStepIds
  }
}

function addEvidenceContext(
  details: Record<string, unknown> | undefined,
  options: {
    runtimeEvidenceRefs?: string[]
    factRefs?: string[]
    contradictionRefs?: string[]
    unknownEvidenceRefs?: string[]
  }
) {
  return {
    ...(details ?? {}),
    ...(options.runtimeEvidenceRefs ? { runtimeEvidenceRefs: options.runtimeEvidenceRefs } : {}),
    ...(options.factRefs ? { factRefs: options.factRefs } : {}),
    ...(options.contradictionRefs ? { contradictionRefs: options.contradictionRefs } : {}),
    ...(options.unknownEvidenceRefs ? { unknownEvidenceRefs: options.unknownEvidenceRefs } : {})
  }
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
  const factRefs = input.verdict.factRefs
  const contradictions = input.verdict.contradictions
  const unknownEvidence = input.verdict.unknownEvidence
  const runtimeEvidence: FactRecord[] = []
  const continuityContext = {
    factRefs: factRefs?.map((fact) => fact.id),
    contradictionRefs: contradictions?.map((item) => item.id),
    unknownEvidenceRefs: unknownEvidence?.map((item) => item.id)
  }

  if (selectedPath.boundary.kind === 'blocked' && selectedPath.steps.length === 0) {
    events.push(
      event(
        'blocked',
        selectedPath.boundary.reason,
        selectedPath.boundary.stepId,
        addEvidenceContext(
          {
            nextAction: selectedPath.boundary.nextAction
          },
          continuityContext
        )
      )
    )

    const blockerEvidence = runtimeEvidenceFact(
      `fact:runtime:boundary:${selectedPath.boundary.stepId ?? 'none'}:blocked`,
      `execution.boundary.${selectedPath.boundary.stepId ?? 'none'}`,
      'missing',
      selectedPath.boundary.reason,
      selectedPath.boundary.stepId ? [selectedPath.boundary.stepId] : []
    )
    runtimeEvidence.push(blockerEvidence)

    return {
      status: 'blocked',
      reason: selectedPath.boundary.reason,
      nextAction: selectedPath.boundary.nextAction,
      executedStepIds,
      events,
      caveats,
      factRefs,
      contradictions,
      unknownEvidence,
      runtimeEvidence
    }
  }

  for (const step of selectedPath.steps.filter((candidate) => candidate.mode === 'execute')) {
    events.push(event('step-start', `Running ${step.id}`, step.id, { run: step.run }))

    const result = await runStep(input.repoRoot, step)

    if (result.status !== 'succeeded') {
      const failureEvidence = runtimeEvidenceFact(
        `fact:runtime:step:${step.id}:failed`,
        `step.${step.id}.result`,
        'missing',
        `step ${step.id} failed`,
        [step.id]
      )
      runtimeEvidence.push(failureEvidence)
      events.push(
        event(
          'step-failed',
          `Step ${step.id} failed`,
          step.id,
          addEvidenceContext(
            {
              status: result.status,
              exitCode: result.exitCode,
              stderr: result.stderr,
              nextAction: 'Fix the failing step and rerun Pullstart.'
            },
            {
              ...continuityContext,
              runtimeEvidenceRefs: [failureEvidence.id]
            }
          )
        )
      )

      return {
        status: 'blocked',
        reason: `step ${step.id} failed`,
        nextAction: 'Fix the failing step and rerun Pullstart.',
        executedStepIds,
        events,
        caveats,
        factRefs,
        contradictions,
        unknownEvidence,
        runtimeEvidence
      }
    }

    executedStepIds.push(step.id)
    const successEvidence = runtimeEvidenceFact(
      `fact:runtime:step:${step.id}:succeeded`,
      `step.${step.id}.result`,
      'satisfied',
      `step ${step.id} completed`,
      [step.id]
    )
    runtimeEvidence.push(successEvidence)
    events.push(
      event(
        'step-success',
        `Step ${step.id} completed`,
        step.id,
        addEvidenceContext(
          {
            exitCode: result.exitCode,
            durationMs: result.durationMs
          },
          {
            ...continuityContext,
            runtimeEvidenceRefs: [successEvidence.id]
          }
        )
      )
    )
  }

  if (selectedPath.boundary.kind === 'guided' && selectedPath.boundary.stepId) {
    const guidedStep = selectedPath.steps.find((step) => step.id === selectedPath.boundary.stepId)

    events.push(
      event(
        'step-guided',
        selectedPath.boundary.reason,
        selectedPath.boundary.stepId,
        addEvidenceContext(
          {
            nextAction: selectedPath.boundary.nextAction
          },
          continuityContext
        )
      )
    )

    if (guidedStep?.id === 'start-app' && input.verification) {
      const managed = await runManaged(input.repoRoot, guidedStep.run, input.verification)

      if (managed.status === 'success') {
        const managedEvidenceIds = managed.runtimeEvidence?.map((item) => item.id) ?? []
        if (managed.runtimeEvidence?.length) {
          runtimeEvidence.push(...managed.runtimeEvidence)
        }
        events.push(
          event(
            'verification-success',
            managed.reason,
            guidedStep.id,
            addEvidenceContext(
              {
                logs: managed.logs,
                ...managed.details
              },
              {
                ...continuityContext,
                runtimeEvidenceRefs: managedEvidenceIds
              }
            )
          )
        )

        return {
          status: 'success',
          reason: managed.reason,
          executedStepIds,
          guidedStepId: guidedStep.id,
          events,
          caveats,
          factRefs,
          contradictions,
          unknownEvidence,
          runtimeEvidence
        }
      }

      const managedEvidenceIds = managed.runtimeEvidence?.map((item) => item.id) ?? []
      if (managed.runtimeEvidence?.length) {
        runtimeEvidence.push(...managed.runtimeEvidence)
      }
      events.push(
        event(
          'verification-failed',
          managed.reason,
          guidedStep.id,
          addEvidenceContext(
            {
              logs: managed.logs,
              ...managed.details,
              nextAction: managed.nextAction
            },
            {
              ...continuityContext,
              runtimeEvidenceRefs: managedEvidenceIds
            }
          )
        )
      )

      return {
        status: 'blocked',
        reason: managed.reason,
        nextAction: managed.nextAction,
        executedStepIds,
        guidedStepId: guidedStep.id,
        events,
        caveats,
        factRefs,
        contradictions,
        unknownEvidence,
        runtimeEvidence
      }
    }

    return {
      status: 'blocked',
      reason: selectedPath.boundary.reason,
      nextAction: selectedPath.boundary.nextAction,
      executedStepIds,
      guidedStepId: selectedPath.boundary.stepId,
      events,
      caveats,
      factRefs,
      contradictions,
      unknownEvidence,
      runtimeEvidence
    }
  }

  return {
    status: 'success',
    reason: 'finite execution path completed without guided boundaries',
    executedStepIds,
    events,
    caveats,
    factRefs,
    contradictions,
    unknownEvidence,
    runtimeEvidence
  }
}
