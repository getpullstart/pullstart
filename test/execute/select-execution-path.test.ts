import { describe, expect, it } from 'vitest'

import type { CapabilityVerdict } from '../../src/capability/capability-types.js'
import type { BootstrapPlan } from '../../src/planner/plan-types.js'
import { selectExecutionPath } from '../../src/execute/select-execution-path.js'

function createPlan(overrides?: Partial<BootstrapPlan>): BootstrapPlan {
  return {
    blockers: [],
    selectedServiceOptions: [],
    satisfiedFacts: [],
    steps: [
      { id: 'install', name: 'Install dependencies', run: 'pnpm install', status: 'ready', dependsOn: [] },
      {
        id: 'start-postgres',
        name: 'Start PostgreSQL',
        run: 'docker compose up -d postgres',
        status: 'pending',
        dependsOn: ['install']
      },
      {
        id: 'migrate',
        name: 'Run database migrations',
        run: 'pnpm db:migrate',
        status: 'pending',
        dependsOn: ['install', 'start-postgres']
      },
      {
        id: 'start-app',
        name: 'Start API',
        run: 'pnpm dev',
        status: 'pending',
        dependsOn: ['install', 'start-postgres', 'migrate']
      }
    ],
    ...overrides
  }
}

function createVerdict(overrides?: Partial<CapabilityVerdict>): CapabilityVerdict {
  return {
    decision: 'can-act',
    nextStepId: 'install',
    checks: [],
    caveats: [],
    ...overrides
  }
}

describe('EXEC-01 selectExecutionPath', () => {
  it('returns shortest safe execute path and guides at start-app boundary', () => {
    const path = selectExecutionPath(createPlan(), createVerdict())

    expect(path.steps.map((step) => `${step.id}:${step.mode}`)).toEqual([
      'install:execute',
      'start-postgres:execute',
      'migrate:execute',
      'start-app:guide'
    ])
    expect(path.boundary.kind).toBe('guided')
    expect(path.boundary.stepId).toBe('start-app')
  })

  it('returns no executable steps when verdict requires user action', () => {
    const path = selectExecutionPath(
      createPlan(),
      createVerdict({
        decision: 'needs-user-action',
        requiredUserAction: 'Install Node.js 20.x'
      })
    )

    expect(path.steps).toEqual([])
    expect(path.boundary.kind).toBe('blocked')
    expect(path.boundary.nextAction).toContain('Node.js')
  })

  it('returns blocked boundary when verdict must pause', () => {
    const path = selectExecutionPath(
      createPlan(),
      createVerdict({
        decision: 'must-pause',
        requiredUserAction: 'Fix repository permissions'
      })
    )

    expect(path.steps).toEqual([])
    expect(path.boundary.kind).toBe('blocked')
    expect(path.boundary.reason).toContain('must-pause')
  })
})
