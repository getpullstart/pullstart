import type { SetupSpec } from '../contract/setup-spec-types.js'
import type { EvidenceContradiction, FactRecord } from '../evidence/evidence-types.js'
import type { MachineInspectionResult } from '../inspect/machine-inspector.js'
import type { RepoInspectionResult } from '../inspect/repo-inspector.js'
import type {
  BootstrapPlan,
  PlanFactRef,
  PlanBlocker,
  PlanStatus,
  SelectedServiceOption
} from './plan-types.js'

function toPlanFactRef(fact: FactRecord): PlanFactRef {
  return {
    id: fact.id,
    source: fact.source,
    subject: fact.subject,
    state: fact.state,
    summary: fact.summary,
    affectsStepIds: fact.affectsStepIds
  }
}

function makeBlocker(
  id: string,
  scope: PlanBlocker['scope'],
  message: string,
  stepIds: string[],
  metadata: Pick<PlanBlocker, 'factRefs' | 'contradictionRefs'> = {}
): PlanBlocker {
  return {
    id,
    scope,
    message,
    stepIds,
    ...metadata
  }
}

function collectContradictions(repoFacts: FactRecord[]): EvidenceContradiction[] {
  const contradictions: EvidenceContradiction[] = []
  const declaredServiceOptions = repoFacts.filter(
    (fact) =>
      fact.source === 'declared' &&
      fact.subject.startsWith('service-option.') &&
      fact.subject.endsWith('.declared')
  )

  for (const declared of declaredServiceOptions) {
    const observed = repoFacts.find(
      (fact) =>
        fact.subject.replace('.viability', '') === declared.subject.replace('.declared', '') &&
        fact.source === 'inferred'
    )
    if (!observed || observed.state !== 'missing') {
      continue
    }

    const optionId = declared.subject.split('.')[2]
    contradictions.push({
      id: `contradiction:service-option:${optionId}:declared-vs-observed`,
      declaredFactId: declared.id,
      observedFactId: observed.id,
      summary: `Declared service option ${optionId} is not currently viable from observed repo evidence`,
      affectsStepIds: Array.from(new Set([...declared.affectsStepIds, ...observed.affectsStepIds]))
    })
  }

  return contradictions
}

function selectServiceOptions(
  repoInspection: RepoInspectionResult,
  machineInspection: MachineInspectionResult,
  contradictions: EvidenceContradiction[],
  factMap: Map<string, FactRecord>
) {
  const selected: SelectedServiceOption[] = []
  const branchBlockers: PlanBlocker[] = []
  const groupedOptions = repoInspection.serviceOptions.reduce<
    Record<string, RepoInspectionResult['serviceOptions']>
  >((acc, option) => {
    acc[option.serviceName] ??= []
    acc[option.serviceName].push(option)
    return acc
  }, {})

  for (const [service, options] of Object.entries(groupedOptions)) {
    const serviceHealth = machineInspection.services.find(
      (candidate) => candidate.serviceName === service
    )
    const dockerSatisfied = machineInspection.tools.find(
      (tool) => tool.name === 'docker'
    )?.satisfied

    const existing = options.find((option) => option.type === 'existing')
    const compose = options.find((option) => option.type === 'docker-compose')

    if (existing && serviceHealth?.reachable) {
      selected.push({
        serviceName: service,
        optionId: existing.optionId,
        reason: 'existing local service is already reachable'
      })
      continue
    }

    if (compose?.viable && dockerSatisfied) {
      selected.push({
        serviceName: service,
        optionId: compose.optionId,
        reason: 'compose-backed service path is available and can satisfy the proof slice'
      })
      continue
    }

    if (existing) {
      selected.push({
        serviceName: service,
        optionId: existing.optionId,
        reason: 'fallback to existing service option because no compose path is available'
      })
    }

    const serviceContradictions = contradictions.filter((contradiction) =>
      contradiction.affectsStepIds.some((stepId) => ['start-postgres', 'migrate', 'start-app'].includes(stepId))
    )
    const contradictionRefs = serviceContradictions.map((contradiction) => contradiction.id)
    const contradictionFacts = serviceContradictions.flatMap((contradiction) =>
      [contradiction.declaredFactId, contradiction.observedFactId]
        .map((id) => factMap.get(id))
        .filter((fact): fact is FactRecord => Boolean(fact))
        .map(toPlanFactRef)
    )

    branchBlockers.push(
      makeBlocker(
        `service:${service}`,
        'service',
        `No viable service branch is currently ready for ${service}.`,
        ['start-postgres', 'migrate', 'start-app'],
        {
          factRefs: contradictionFacts,
          contradictionRefs
        }
      )
    )
  }

  return {
    selected,
    branchBlockers
  }
}

function blockersForPlan(
  repoInspection: RepoInspectionResult,
  machineInspection: MachineInspectionResult,
  selectedOptions: SelectedServiceOption[]
) {
  const blockers: PlanBlocker[] = []
  const repoMissingFactIdByEvidence: Record<string, string> = {
    'package-json': 'fact:repo:package-json',
    'env-example': 'fact:repo:env-example',
    'install-step': 'fact:repo:install-step-declared',
    'migration-step': 'fact:repo:migration-step-declared',
    'start-step': 'fact:repo:start-step-declared',
    'verify-target': 'fact:repo:verify-target'
  }

  for (const missing of repoInspection.missingEvidence) {
    const stepIds =
      missing === 'package-json' || missing === 'install-step'
        ? ['install', 'migrate', 'start-app']
        : missing === 'migration-step'
          ? ['migrate']
          : missing === 'start-step'
            ? ['start-app']
            : []

    blockers.push(
      makeBlocker(
        `repo:${missing}`,
        'repo',
        `Repo evidence is missing: ${missing}.`,
        stepIds,
        {
          factRefs: repoInspection.facts
            .filter((fact) => fact.id === repoMissingFactIdByEvidence[missing])
            .map((fact) => ({
              ...fact,
              state: 'missing'
            }))
            .map(toPlanFactRef)
        }
      )
    )
  }

  for (const tool of machineInspection.tools) {
    if (!tool.relevant || tool.satisfied) {
      continue
    }

    const selectedCompose = selectedOptions.some((option) => option.optionId === 'docker-compose')
    const stepIds =
      tool.name === 'docker' && selectedCompose
        ? ['start-postgres', 'migrate', 'start-app']
        : ['install', 'migrate', 'start-app']

    blockers.push(
      makeBlocker(
        `tool:${tool.name}`,
        'tool',
        `Required tool ${tool.name} does not satisfy ${tool.expectedRange}.`,
        stepIds,
        {
          factRefs: machineInspection.facts
            .filter((fact) => fact.id === `fact:machine:tool:${tool.name}`)
            .map((fact) => ({
              ...fact,
              state: 'missing'
            }))
            .map(toPlanFactRef)
        }
      )
    )
  }

  for (const envFile of machineInspection.envFiles) {
    if (!envFile.exists) {
      blockers.push(
        makeBlocker(
          `env-file:${envFile.path}`,
          'env-file',
          `Missing env file ${envFile.path}; expected template ${envFile.example}.`,
          ['migrate', 'start-app'],
          {
            factRefs: machineInspection.facts
              .filter((fact) => fact.id === `fact:machine:env-file:${envFile.path}`)
              .map((fact) => ({
                ...fact,
                state: 'missing'
              }))
              .map(toPlanFactRef)
          }
        )
      )
    }
  }

  for (const envVar of machineInspection.envVars) {
    if (!envVar.present) {
      blockers.push(
        makeBlocker(
          `env-var:${envVar.name}`,
          'env-var',
          `Required env var ${envVar.name} is missing from the runtime env file.`,
          ['migrate', 'start-app'],
          {
            factRefs: machineInspection.facts
              .filter((fact) => fact.id === `fact:machine:env-var:${envVar.name}`)
              .map((fact) => ({
                ...fact,
                state: 'missing'
              }))
              .map(toPlanFactRef)
          }
        )
      )
    }
  }

  const existingSelected = selectedOptions.some((option) => option.optionId === 'local-instance')

  for (const service of machineInspection.services) {
    if (!service.reachable && existingSelected) {
      blockers.push(
        makeBlocker(
          `service:${service.serviceName}`,
          'service',
          `Service ${service.serviceName} is not reachable at ${service.target}.`,
          ['migrate', 'start-app'],
          {
            factRefs: machineInspection.facts
              .filter((fact) => fact.id === `fact:machine:service:${service.serviceName}`)
              .map((fact) => ({
                ...fact,
                state: 'missing'
              }))
              .map(toPlanFactRef)
          }
        )
      )
    }
  }

  return blockers
}

function hasBlockingIssue(blockers: PlanBlocker[], stepId: string) {
  return blockers.some((blocker) => blocker.stepIds.includes(stepId))
}

export function buildPlan(
  spec: SetupSpec,
  repoInspection: RepoInspectionResult,
  machineInspection: MachineInspectionResult
): BootstrapPlan {
  const factRefs: FactRecord[] = [...repoInspection.facts, ...machineInspection.facts]
  const factMap = new Map(factRefs.map((fact) => [fact.id, fact]))
  const contradictions = collectContradictions(repoInspection.facts)
  const serviceSelection = selectServiceOptions(repoInspection, machineInspection, contradictions, factMap)
  const blockers = [
    ...serviceSelection.branchBlockers,
    ...blockersForPlan(repoInspection, machineInspection, serviceSelection.selected)
  ]

  const selectedCompose = serviceSelection.selected.some(
    (option) => option.optionId === 'docker-compose'
  )

  const steps = spec.steps.map((step, index) => {
    const dependsOn = spec.steps.slice(0, index).map((previous) => previous.id)
    const blocked = hasBlockingIssue(blockers, step.id)
    let status: PlanStatus = 'pending'
    let reason: string | undefined

    if (step.id === 'start-postgres' && !selectedCompose) {
      status = 'skipped'
      reason = 'existing local postgres option was selected for the proof path'
    } else if (blocked) {
      status = 'blocked'
      reason = 'resolve blockers before this step is safe to run'
    } else if (index === 0) {
      status = 'ready'
      reason = 'first actionable step in the shortest safe path'
    } else {
      status = 'pending'
      reason = `wait for ${dependsOn[dependsOn.length - 1]} to complete first`
    }

    return {
      id: step.id,
      name: step.name,
      run: step.run,
      status,
      dependsOn,
      reason
    }
  })

  const satisfiedFacts = [
    ...repoInspection.presentEvidence.map((evidence) => `repo:${evidence}`),
    ...machineInspection.tools
      .filter((tool) => tool.relevant && tool.satisfied)
      .map((tool) => `tool:${tool.name}`),
    ...machineInspection.envFiles
      .filter((file) => file.exists)
      .map((file) => `env-file:${file.path}`),
    ...machineInspection.envVars
      .filter((variable) => variable.present)
      .map((variable) => `env-var:${variable.name}`),
    ...machineInspection.services
      .filter((service) => service.reachable)
      .map((service) => `service:${service.serviceName}`)
  ]
  const satisfiedFactRefs = factRefs
    .filter((fact) => fact.state === 'satisfied')
    .map(toPlanFactRef)

  return {
    blockers,
    selectedServiceOptions: serviceSelection.selected,
    satisfiedFacts,
    satisfiedFactRefs,
    factRefs,
    contradictions,
    steps
  }
}
