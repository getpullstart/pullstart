import { resolve } from 'node:path'

import { loadSetupSpec } from '../contract/load-setup-spec.js'
import { inspectMachine } from '../inspect/machine-inspector.js'
import { inspectRepo } from '../inspect/repo-inspector.js'
import { buildPlan } from '../planner/build-plan.js'
import { renderPlan } from '../planner/render-plan.js'

interface PlanCliDeps {
  cwd: () => string
  stdout: Pick<typeof process.stdout, 'write'>
  loadSetupSpec: typeof loadSetupSpec
  inspectRepo: typeof inspectRepo
  inspectMachine: typeof inspectMachine
  buildPlan: typeof buildPlan
  renderPlan: typeof renderPlan
}

const defaultDeps: PlanCliDeps = {
  cwd: () => process.cwd(),
  stdout: process.stdout,
  loadSetupSpec,
  inspectRepo,
  inspectMachine,
  buildPlan,
  renderPlan
}

export async function main(
  args: string[] = process.argv.slice(2),
  deps: PlanCliDeps = defaultDeps
) {
  const repoRoot = deps.cwd()
  const setupSpecPath = resolve(repoRoot, 'setup.spec.yaml')
  const loaded = deps.loadSetupSpec(setupSpecPath)
  const repoInspection = deps.inspectRepo(loaded.spec, repoRoot)
  const machineInspection = await deps.inspectMachine(loaded.spec, repoRoot, {
    repoInspection
  })
  const plan = deps.buildPlan(loaded.spec, repoInspection, machineInspection)
  const includeSummary = args.includes('--summary')

  deps.stdout.write(`${JSON.stringify(plan, null, 2)}\n`)

  if (includeSummary) {
    deps.stdout.write(`\n${deps.renderPlan(plan)}\n`)
  }

  return plan
}
