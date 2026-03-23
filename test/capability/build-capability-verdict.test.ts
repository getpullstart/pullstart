import { describe, expect, it } from 'vitest'

import { buildCapabilityVerdict } from '../../src/capability/build-capability-verdict.js'
import { loadSetupSpec } from '../../src/contract/load-setup-spec.js'
import type { MachineInspectionResult } from '../../src/inspect/machine-inspector.js'
import type { BootstrapPlan } from '../../src/planner/plan-types.js'
import type { CapabilityFamily, SessionInspectionResult } from '../../src/capability/capability-types.js'

const loaded = loadSetupSpec(
  new URL('../../contracts/setup.spec.example.yaml', import.meta.url).pathname
)

function createPlan(overrides?: Partial<BootstrapPlan>): BootstrapPlan {
  return {
    blockers: [],
    selectedServiceOptions: [],
    satisfiedFacts: [],
    satisfiedFactRefs: [],
    factRefs: [],
    contradictions: [],
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
    unknownEvidence: [
      {
        id: 'unknown:auth:registry',
        source: 'inferred',
        scope: 'auth',
        state: 'unresolved-until-execution',
        rationale: 'registry authentication cannot be proven until dependency install is attempted',
        affectsStepIds: ['install']
      },
      {
        id: 'unknown:network:registry',
        source: 'inferred',
        scope: 'network',
        state: 'unresolved-until-execution',
        rationale: 'network reachability for package install cannot be proven pre-execution',
        affectsStepIds: ['install']
      }
    ],
    facts: [
      {
        id: 'fact:session:repo-root-writable',
        source: 'observed-machine',
        subject: 'permissions.repoRootWritable',
        state: 'satisfied',
        summary: 'Repo root is writable',
        affectsStepIds: ['install', 'migrate', 'start-app']
      }
    ],
    blockers: [],
    ...overrides
  }
}

describe('CAP-01/CAP-02 buildCapabilityVerdict', () => {
  it('supports all typed CAP-02 verdict families', () => {
    const families: CapabilityFamily[] = [
      'ready',
      'ready-with-manual-step',
      'blocked-by-machine-prereq',
      'blocked-by-repo-gap',
      'blocked-by-external-access',
      'unsafe-to-execute',
      'unknown-requires-review'
    ]

    expect(families).toHaveLength(7)
  })

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
    expect(verdict.family).toBe('blocked-by-machine-prereq')
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
    expect(verdict.family).toBe('unsafe-to-execute')
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
    expect(verdict.family).toBe('unknown-requires-review')
    expect(verdict.nextStepId).toBe('install')
    expect(verdict.unknownEvidence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'unknown:auth:registry',
          state: 'unresolved-until-execution'
        }),
        expect.objectContaining({
          id: 'unknown:network:registry',
          state: 'unresolved-until-execution'
        })
      ])
    )
    expect(verdict.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'auth:registry',
          state: 'unknown',
          unknownState: 'unresolved-until-execution',
          evidence: expect.arrayContaining(['unknown:auth:registry'])
        }),
        expect.objectContaining({
          id: 'network:registry',
          state: 'unknown',
          unknownState: 'unresolved-until-execution',
          evidence: expect.arrayContaining(['unknown:network:registry'])
        })
      ])
    )
    expect(verdict.caveats).toEqual(
      expect.arrayContaining([
        expect.stringContaining('authentication'),
        expect.stringContaining('Network')
      ])
    )
  })

  it('threads planner fact and contradiction references into capability checks', () => {
    const verdict = buildCapabilityVerdict(
      loaded.spec,
      createPlan({
        blockers: [
          {
            id: 'service:postgres',
            scope: 'service',
            message: 'No viable service branch is currently ready for postgres.',
            stepIds: ['start-postgres', 'migrate', 'start-app'],
            factRefs: [
              {
                id: 'fact:repo:service-option:docker-compose:declared',
                source: 'declared',
                subject: 'service-option.postgres.docker-compose.declared',
                state: 'satisfied',
                summary: 'docker-compose declared as supported path',
                affectsStepIds: ['start-postgres', 'migrate', 'start-app']
              },
              {
                id: 'fact:repo:service-option:docker-compose:viability',
                source: 'inferred',
                subject: 'service-option.postgres.docker-compose.viability',
                state: 'missing',
                summary: 'repo is missing docker compose hints',
                affectsStepIds: ['start-postgres', 'migrate', 'start-app']
              }
            ],
            contradictionRefs: ['contradiction:service-option:docker-compose:declared-vs-observed']
          }
        ],
        factRefs: [
          {
            id: 'fact:repo:service-option:docker-compose:declared',
            source: 'declared',
            subject: 'service-option.postgres.docker-compose.declared',
            state: 'satisfied',
            summary: 'docker-compose declared as supported path',
            affectsStepIds: ['start-postgres', 'migrate', 'start-app']
          }
        ],
        contradictions: [
          {
            id: 'contradiction:service-option:docker-compose:declared-vs-observed',
            declaredFactId: 'fact:repo:service-option:docker-compose:declared',
            observedFactId: 'fact:repo:service-option:docker-compose:viability',
            summary: 'Declared compose path conflicts with observed repo hints',
            affectsStepIds: ['start-postgres', 'migrate', 'start-app']
          }
        ]
      }),
      createMachine(),
      createSession()
    )

    expect(verdict.contradictions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'contradiction:service-option:docker-compose:declared-vs-observed'
        })
      ])
    )
    expect(verdict.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'service:postgres',
          contradictionRefs: ['contradiction:service-option:docker-compose:declared-vs-observed'],
          factRefs: expect.arrayContaining([
            'fact:repo:service-option:docker-compose:declared',
            'fact:repo:service-option:docker-compose:viability'
          ])
        })
      ])
    )
    expect(verdict.factRefs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'fact:repo:service-option:docker-compose:declared'
        }),
        expect.objectContaining({
          id: 'fact:session:repo-root-writable'
        })
      ])
    )
    expect(verdict.family).toBe('blocked-by-machine-prereq')
  })
})
