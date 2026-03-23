import { describe, expect, it } from 'vitest'

import { buildCapabilityVerdict } from '../../src/capability/build-capability-verdict.js'
import { loadSetupSpec } from '../../src/contract/load-setup-spec.js'
import type { MachineInspectionResult } from '../../src/inspect/machine-inspector.js'
import type { BootstrapPlan } from '../../src/planner/plan-types.js'
import type { SessionInspectionResult } from '../../src/capability/capability-types.js'

const loaded = loadSetupSpec(
  new URL('../../contracts/setup.spec.example.yaml', import.meta.url).pathname
)

function createPlan(overrides?: Partial<BootstrapPlan>): BootstrapPlan {
  return {
    blockers: [],
    selectedServiceOptions: [],
    satisfiedFacts: [],
    steps: [
      {
        id: 'install',
        name: 'Install dependencies',
        run: 'pnpm install',
        status: 'ready',
        dependsOn: []
      },
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

function createMachine(overrides?: Partial<MachineInspectionResult>): MachineInspectionResult {
  return {
    repoRoot: '/tmp/proof-repo',
    tools: [
      {
        name: 'node',
        required: true,
        relevant: true,
        expectedRange: '20.x',
        detectedVersion: 'v20.11.1',
        satisfied: true
      },
      {
        name: 'pnpm',
        required: true,
        relevant: true,
        expectedRange: '9.x',
        detectedVersion: '9.12.0',
        satisfied: true
      }
    ],
    envFiles: [{ path: '.env', exists: true, example: '.env.example' }],
    envVars: [
      { name: 'DATABASE_URL', source: '.env.example', present: true },
      { name: 'PORT', source: '.env.example', present: true }
    ],
    services: [{ serviceName: 'postgres', target: 'localhost:5432', reachable: true }],
    blockers: [],
    ...overrides
  }
}

function createSession(overrides?: Partial<SessionInspectionResult>): SessionInspectionResult {
  return {
    repoRoot: '/tmp/proof-repo',
    permissions: { repoRootWritable: true },
    unknowns: ['auth', 'network'],
    blockers: [],
    ...overrides
  }
}

describe('CAP-01/CAP-02 buildCapabilityVerdict', () => {
  it('returns needs-user-action for missing required setup evidence', () => {
    const verdict = buildCapabilityVerdict(
      loaded.spec,
      createPlan({
        blockers: [
          {
            id: 'tool:node',
            scope: 'tool',
            message: 'Required tool node is missing.',
            stepIds: ['install', 'migrate', 'start-app']
          }
        ]
      }),
      createMachine(),
      createSession()
    )

    expect(verdict.decision).toBe('needs-user-action')
    expect(verdict.nextStepId).toBe('install')
    expect(verdict.requiredUserAction).toBeTruthy()
  })

  it('returns must-pause for unsafe local permissions state', () => {
    const verdict = buildCapabilityVerdict(
      loaded.spec,
      createPlan(),
      createMachine(),
      createSession({
        permissions: { repoRootWritable: false },
        blockers: ['permission:repo-root-not-writable']
      })
    )

    expect(verdict.decision).toBe('must-pause')
    expect(verdict.requiredUserAction).toContain('write access')
  })

  it('returns can-act with caveats when unknown auth and network remain', () => {
    const verdict = buildCapabilityVerdict(
      loaded.spec,
      createPlan(),
      createMachine(),
      createSession()
    )

    expect(verdict.decision).toBe('can-act')
    expect(verdict.nextStepId).toBe('install')
    expect(verdict.caveats).toEqual(
      expect.arrayContaining([
        expect.stringContaining('authentication'),
        expect.stringContaining('Network')
      ])
    )
  })
})
