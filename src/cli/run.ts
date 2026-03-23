import { resolve } from 'node:path'

import { buildCapabilityVerdict } from '../capability/build-capability-verdict.js'
import { loadSetupSpec } from '../contract/load-setup-spec.js'
import { runBootstrap } from '../execute/run-bootstrap.js'
import { renderRunOutcome } from '../execute/render-run-outcome.js'
import { inspectMachine } from '../inspect/machine-inspector.js'
import { inspectRepo } from '../inspect/repo-inspector.js'
import { inspectSession } from '../inspect/session-inspector.js'
import { buildPlan } from '../planner/build-plan.js'

interface RunCliDeps {
  cwd: () => string
  stdout: Pick<typeof process.stdout, 'write'>
  loadSetupSpec: typeof loadSetupSpec
  inspectRepo: typeof inspectRepo
  inspectMachine: typeof inspectMachine
  buildPlan: typeof buildPlan
  inspectSession: typeof inspectSession
  buildCapabilityVerdict: typeof buildCapabilityVerdict
  runBootstrap: typeof runBootstrap
  renderRunOutcome: typeof renderRunOutcome
}

const defaultDeps: RunCliDeps = {
  cwd: () => process.cwd(),
  stdout: process.stdout,
  loadSetupSpec,
  inspectRepo,
  inspectMachine,
  buildPlan,
  inspectSession,
  buildCapabilityVerdict,
  runBootstrap,
  renderRunOutcome
}

export async function main(args: string[] = process.argv.slice(2), deps: RunCliDeps = defaultDeps) {
  const repoRoot = deps.cwd()
  const setupSpecPath = resolve(repoRoot, 'setup.spec.yaml')
  const loaded = deps.loadSetupSpec(setupSpecPath)
  const repoInspection = deps.inspectRepo(loaded.spec, repoRoot)
  const machineInspection = await deps.inspectMachine(loaded.spec, repoRoot, {
    repoInspection
  })
  const plan = deps.buildPlan(loaded.spec, repoInspection, machineInspection)
  const sessionInspection = deps.inspectSession(repoRoot)
  const verdict = deps.buildCapabilityVerdict(
    loaded.spec,
    plan,
    machineInspection,
    sessionInspection
  )

  const firstVerification = loaded.spec.verify[0]
  const outcome = await deps.runBootstrap({
    repoRoot,
    plan,
    verdict,
    verification: firstVerification
  })

  deps.stdout.write(`${JSON.stringify(outcome, null, 2)}\n`)

  if (args.includes('--summary')) {
    deps.stdout.write(`\n${deps.renderRunOutcome(outcome)}\n`)
  }

  return outcome
}
