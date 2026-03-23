import type { SetupSpec } from '../contract/setup-spec-types.js'
import type { MachineInspectionResult } from '../inspect/machine-inspector.js'
import type { BootstrapPlan, PlanBlocker } from '../planner/plan-types.js'
import type {
  CapabilityCheck,
  CapabilityDomain,
  CapabilityFamily,
  CapabilityVerdict,
  SessionInspectionResult
} from './capability-types.js'

function blockerDomain(scope: PlanBlocker['scope']): CapabilityDomain {
  switch (scope) {
    case 'tool':
      return 'toolchain'
    case 'env-file':
    case 'env-var':
      return 'env'
    case 'service':
      return 'service'
    case 'repo':
      return 'repo'
    default:
      return 'repo'
  }
}

function blockerAction(blocker: PlanBlocker) {
  switch (blocker.scope) {
    case 'tool':
      return 'Install or update required tool before continuing.'
    case 'env-file':
      return 'Create the required env file from the declared example file.'
    case 'env-var':
      return 'Provide the missing env value in the required env file.'
    case 'service':
      return 'Start or make the required service reachable for the proof path.'
    case 'repo':
      return 'Fix missing repo setup evidence before continuing.'
    default:
      return 'Resolve the blocker before continuing.'
  }
}

function machineChecks(machineInspection: MachineInspectionResult): CapabilityCheck[] {
  const checks: CapabilityCheck[] = []

  for (const tool of machineInspection.tools) {
    checks.push({
      id: `tool:${tool.name}`,
      domain: 'toolchain',
      state: tool.relevant ? (tool.satisfied ? 'ready' : 'blocked') : 'not-needed',
      summary: tool.relevant
        ? tool.satisfied
          ? `${tool.name} satisfies ${tool.expectedRange}`
          : `${tool.name} does not satisfy ${tool.expectedRange}`
        : `${tool.name} is not needed for the selected proof path`,
      evidence: [tool.detectedVersion ?? 'not-detected'],
      affectsStepIds: ['install', 'migrate', 'start-app'],
      userAction: tool.satisfied ? undefined : `Install ${tool.name} ${tool.expectedRange}`
    })
  }

  for (const envFile of machineInspection.envFiles) {
    checks.push({
      id: `env-file:${envFile.path}`,
      domain: 'env',
      state: envFile.exists ? 'ready' : 'blocked',
      summary: envFile.exists
        ? `${envFile.path} exists`
        : `${envFile.path} is missing (expected from ${envFile.example})`,
      evidence: [envFile.example],
      affectsStepIds: ['migrate', 'start-app'],
      userAction: envFile.exists ? undefined : `Create ${envFile.path} from ${envFile.example}`
    })
  }

  for (const envVar of machineInspection.envVars) {
    checks.push({
      id: `env-var:${envVar.name}`,
      domain: 'env',
      state: envVar.present ? 'ready' : 'blocked',
      summary: envVar.present
        ? `${envVar.name} is present`
        : `${envVar.name} is missing from ${envVar.source}`,
      evidence: [envVar.source],
      affectsStepIds: ['migrate', 'start-app'],
      userAction: envVar.present ? undefined : `Add ${envVar.name} to ${envVar.source}`
    })
  }

  for (const service of machineInspection.services) {
    checks.push({
      id: `service:${service.serviceName}`,
      domain: 'service',
      state: service.reachable ? 'ready' : 'blocked',
      summary: service.reachable
        ? `${service.serviceName} is reachable at ${service.target}`
        : `${service.serviceName} is not reachable at ${service.target}`,
      evidence: [service.target],
      affectsStepIds: ['migrate', 'start-app'],
      userAction: service.reachable ? undefined : `Start ${service.serviceName} at ${service.target}`
    })
  }

  return checks
}

function unknownChecks(
  nextStepId: string | null,
  sessionInspection: SessionInspectionResult
): CapabilityCheck[] {
  const authRelevant = nextStepId === 'install'
  const networkRelevant = nextStepId === 'install'
  const authUnknown = sessionInspection.unknownEvidence.find((evidence) => evidence.scope === 'auth')
  const networkUnknown = sessionInspection.unknownEvidence.find((evidence) => evidence.scope === 'network')

  return [
    {
      id: 'auth:registry',
      domain: 'auth',
      state: authRelevant ? 'unknown' : 'not-needed',
      summary: authRelevant
        ? 'Registry authentication is not provable before attempting install'
        : 'Auth check is not needed for the next step',
      evidence: [authUnknown?.id ?? 'pre-execution state'],
      factRefs: authUnknown ? [authUnknown.id] : undefined,
      unknownState: authRelevant ? 'unresolved-until-execution' : undefined,
      affectsStepIds: authRelevant ? [nextStepId] : []
    },
    {
      id: 'network:registry',
      domain: 'network',
      state: networkRelevant ? 'unknown' : 'not-needed',
      summary: networkRelevant
        ? 'Network reachability for package install is unknown before execution'
        : 'Network check is not needed for the next step',
      evidence: [networkUnknown?.id ?? 'pre-execution state'],
      factRefs: networkUnknown ? [networkUnknown.id] : undefined,
      unknownState: networkRelevant ? 'unresolved-until-execution' : undefined,
      affectsStepIds: networkRelevant ? [nextStepId] : []
    }
  ]
}

function withStructuredContext(
  plan: BootstrapPlan,
  sessionInspection: SessionInspectionResult,
  payload: Omit<CapabilityVerdict, 'factRefs' | 'contradictions' | 'unknownEvidence'>
): CapabilityVerdict {
  return {
    ...payload,
    factRefs: [...(plan.factRefs ?? []), ...sessionInspection.facts],
    contradictions: plan.contradictions ?? [],
    unknownEvidence: sessionInspection.unknownEvidence
  }
}

function isExternalAccessBlockedCheck(check: CapabilityCheck) {
  if (check.domain === 'auth' || check.domain === 'network') {
    return true
  }

  const normalizedId = check.id.toLowerCase()
  const normalizedSummary = check.summary.toLowerCase()
  const externalTokens = ['auth', 'network', 'registry', 'vpn', 'permission denied', 'private dependency']

  return externalTokens.some(
    (token) => normalizedId.includes(token) || normalizedSummary.includes(token)
  )
}

function deriveFamily(options: {
  decision: CapabilityVerdict['decision']
  nextStepId: string | null
  checks: CapabilityCheck[]
}): CapabilityFamily {
  if (options.decision === 'must-pause') {
    return 'unsafe-to-execute'
  }

  const blocked = options.checks.find((check) => check.state === 'blocked')
  if (blocked) {
    if (isExternalAccessBlockedCheck(blocked)) {
      return 'blocked-by-external-access'
    }

    if (blocked.domain === 'repo') {
      return 'blocked-by-repo-gap'
    }

    return 'blocked-by-machine-prereq'
  }

  const hasUnknown = options.checks.some((check) => check.state === 'unknown')
  if (hasUnknown) {
    return 'unknown-requires-review'
  }

  if (options.nextStepId === 'start-app') {
    return 'ready-with-manual-step'
  }

  return 'ready'
}

export function buildCapabilityVerdict(
  spec: SetupSpec,
  plan: BootstrapPlan,
  machineInspection: MachineInspectionResult,
  sessionInspection: SessionInspectionResult
): CapabilityVerdict {
  const nextStep =
    plan.steps.find((step) => step.status === 'ready') ??
    plan.steps.find((step) => step.status === 'pending') ??
    null
  const nextStepId = nextStep?.id ?? null

  const checks: CapabilityCheck[] = [
    ...plan.blockers.map((blocker) => ({
      id: blocker.id,
      domain: blockerDomain(blocker.scope),
      state: 'blocked' as const,
      summary: blocker.message,
      evidence: [blocker.id],
      factRefs: blocker.factRefs?.map((factRef) => factRef.id),
      contradictionRefs: blocker.contradictionRefs,
      affectsStepIds: blocker.stepIds,
      userAction: blockerAction(blocker)
    })),
    ...machineChecks(machineInspection),
    {
      id: 'permissions:repo-root',
      domain: 'permissions',
      state: sessionInspection.permissions.repoRootWritable ? 'ready' : 'blocked',
      summary: sessionInspection.permissions.repoRootWritable
        ? 'Repo root is writable in this session'
        : 'Repo root is not writable in this session',
      evidence: [sessionInspection.repoRoot],
      affectsStepIds: ['install', 'migrate', 'start-app'],
      userAction: sessionInspection.permissions.repoRootWritable
        ? undefined
        : 'Grant write access to the repository root before continuing.'
    },
    ...unknownChecks(nextStepId, sessionInspection)
  ]

  const caveats = checks
    .filter((check) => check.state === 'unknown')
    .map((check) => check.summary)

  const unsupportedVerify = spec.verify.some((step) => (step as { type?: string }).type !== 'http')
  if (unsupportedVerify) {
    return withStructuredContext(plan, sessionInspection, {
      decision: 'must-pause',
      family: deriveFamily({ decision: 'must-pause', nextStepId, checks }),
      nextStepId,
      checks,
      requiredUserAction: 'Update setup.spec.yaml to only use supported HTTP verification steps.',
      caveats
    })
  }

  if (!sessionInspection.permissions.repoRootWritable) {
    return withStructuredContext(plan, sessionInspection, {
      decision: 'must-pause',
      family: deriveFamily({ decision: 'must-pause', nextStepId, checks }),
      nextStepId,
      checks,
      requiredUserAction: 'Grant write access to the repository root before continuing.',
      caveats
    })
  }

  if (!nextStepId) {
    const firstBlocked = checks.find((check) => check.state === 'blocked')
    if (firstBlocked) {
      return withStructuredContext(plan, sessionInspection, {
        decision: 'needs-user-action',
        family: deriveFamily({ decision: 'needs-user-action', nextStepId: null, checks }),
        nextStepId: null,
        checks,
        requiredUserAction: firstBlocked.userAction ?? firstBlocked.summary,
        caveats
      })
    }

    return withStructuredContext(plan, sessionInspection, {
      decision: 'must-pause',
      family: deriveFamily({ decision: 'must-pause', nextStepId: null, checks }),
      nextStepId: null,
      checks,
      requiredUserAction: 'No actionable setup step is available from the current plan.',
      caveats
    })
  }

  const blockedForNextStep = checks.find(
    (check) => check.state === 'blocked' && check.affectsStepIds.includes(nextStepId)
  )

  if (blockedForNextStep) {
    return withStructuredContext(plan, sessionInspection, {
      decision: 'needs-user-action',
      family: deriveFamily({ decision: 'needs-user-action', nextStepId, checks }),
      nextStepId,
      checks,
      requiredUserAction:
        blockedForNextStep.userAction ??
        `Resolve ${blockedForNextStep.id} before attempting ${nextStepId}.`,
      caveats
    })
  }

  return withStructuredContext(plan, sessionInspection, {
    decision: 'can-act',
    family: deriveFamily({ decision: 'can-act', nextStepId, checks }),
    nextStepId,
    checks,
    caveats
  })
}
