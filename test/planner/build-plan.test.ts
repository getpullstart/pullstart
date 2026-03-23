import { describe, expect, it } from 'vitest'

import { loadSetupSpec } from '../../src/contract/load-setup-spec.js'
import type { MachineInspectionResult } from '../../src/inspect/machine-inspector.js'
import type { RepoInspectionResult } from '../../src/inspect/repo-inspector.js'
import { buildPlan } from '../../src/planner/build-plan.js'

const loaded = loadSetupSpec(
  new URL('../../contracts/setup.spec.example.yaml', import.meta.url).pathname
)

function createRepoInspection(overrides?: Partial<RepoInspectionResult>): RepoInspectionResult {
  return {
    repoRoot: '/tmp/proof-repo',
    packageJsonPresent: true,
    envExamplePresent: true,
    verificationTargets: loaded.spec.verify,
    presentEvidence: [
      'package-json',
      'env-example',
      'install-step',
      'migration-step',
      'start-step',
      'verify-target'
    ],
    missingEvidence: [],
    facts: [
      {
        id: 'fact:repo:package-json',
        source: 'observed-repo',
        subject: 'artifact.package-json',
        state: 'satisfied',
        summary: 'package.json exists',
        affectsStepIds: ['install', 'migrate', 'start-app']
      },
      {
        id: 'fact:repo:env-example',
        source: 'observed-repo',
        subject: 'artifact.env-example',
        state: 'satisfied',
        summary: 'env example exists',
        affectsStepIds: ['migrate', 'start-app']
      },
      {
        id: 'fact:repo:install-step-declared',
        source: 'declared',
        subject: 'step.install',
        state: 'satisfied',
        summary: 'install step declared and script resolvable',
        affectsStepIds: ['install']
      },
      {
        id: 'fact:repo:migration-step-declared',
        source: 'declared',
        subject: 'step.migrate',
        state: 'satisfied',
        summary: 'migration step declared and script resolvable',
        affectsStepIds: ['migrate']
      },
      {
        id: 'fact:repo:start-step-declared',
        source: 'declared',
        subject: 'step.start-app',
        state: 'satisfied',
        summary: 'start step declared and script resolvable',
        affectsStepIds: ['start-app']
      },
      {
        id: 'fact:repo:verify-target',
        source: 'declared',
        subject: 'verify.target',
        state: 'satisfied',
        summary: 'verification target declared',
        affectsStepIds: ['start-app']
      },
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
        state: 'satisfied',
        summary: 'compose hints present in repo',
        affectsStepIds: ['start-postgres', 'migrate', 'start-app']
      },
      {
        id: 'fact:repo:service-option:local-instance:viability',
        source: 'declared',
        subject: 'service-option.postgres.local-instance.viability',
        state: 'satisfied',
        summary: 'existing option available',
        affectsStepIds: ['start-postgres', 'migrate', 'start-app']
      }
    ],
    scripts: {
      install: true,
      migrate: true,
      start: true
    },
    serviceOptions: [
      {
        serviceName: 'postgres',
        optionId: 'docker-compose',
        type: 'docker-compose',
        viable: true,
        reason: 'compose hints present in repo'
      },
      {
        serviceName: 'postgres',
        optionId: 'local-instance',
        type: 'existing',
        viable: true,
        reason: 'existing option available'
      }
    ],
    ...overrides
  }
}

function createMachineInspection(
  overrides?: Partial<MachineInspectionResult>
): MachineInspectionResult {
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
      },
      {
        name: 'docker',
        required: false,
        relevant: true,
        expectedRange: '24+',
        detectedVersion: '24.0.7',
        satisfied: true
      }
    ],
    envFiles: [
      {
        path: '.env',
        exists: true,
        example: '.env.example'
      }
    ],
    envVars: [
      {
        name: 'DATABASE_URL',
        source: '.env.example',
        present: true
      },
      {
        name: 'PORT',
        source: '.env.example',
        present: true
      }
    ],
    services: [
      {
        serviceName: 'postgres',
        target: 'localhost:5432',
        reachable: true
      }
    ],
    facts: [
      {
        id: 'fact:machine:tool:node',
        source: 'observed-machine',
        subject: 'tool.node',
        state: 'satisfied',
        summary: 'node satisfies 20.x',
        affectsStepIds: ['install', 'migrate', 'start-app']
      },
      {
        id: 'fact:machine:tool:pnpm',
        source: 'observed-machine',
        subject: 'tool.pnpm',
        state: 'satisfied',
        summary: 'pnpm satisfies 9.x',
        affectsStepIds: ['install', 'migrate', 'start-app']
      },
      {
        id: 'fact:machine:tool:docker',
        source: 'observed-machine',
        subject: 'tool.docker',
        state: 'satisfied',
        summary: 'docker satisfies 24+',
        affectsStepIds: ['start-postgres', 'migrate', 'start-app']
      },
      {
        id: 'fact:machine:env-file:.env',
        source: 'observed-machine',
        subject: 'env-file..env',
        state: 'satisfied',
        summary: '.env exists',
        affectsStepIds: ['migrate', 'start-app']
      },
      {
        id: 'fact:machine:env-var:DATABASE_URL',
        source: 'observed-machine',
        subject: 'env-var.DATABASE_URL',
        state: 'satisfied',
        summary: 'DATABASE_URL present in .env.example',
        affectsStepIds: ['migrate', 'start-app']
      },
      {
        id: 'fact:machine:env-var:PORT',
        source: 'observed-machine',
        subject: 'env-var.PORT',
        state: 'satisfied',
        summary: 'PORT present in .env.example',
        affectsStepIds: ['migrate', 'start-app']
      },
      {
        id: 'fact:machine:service:postgres',
        source: 'observed-machine',
        subject: 'service.postgres.reachability',
        state: 'satisfied',
        summary: 'postgres reachable at localhost:5432',
        affectsStepIds: ['migrate', 'start-app']
      }
    ],
    blockers: [],
    ...overrides
  }
}

describe('PLAN-03 buildPlan', () => {
  it('preserves contract order and dependency links for the reachable local-instance path', () => {
    const plan = buildPlan(
      loaded.spec,
      createRepoInspection(),
      createMachineInspection({
        tools: [
          createMachineInspection().tools[0],
          createMachineInspection().tools[1],
          {
            name: 'docker',
            required: false,
            relevant: false,
            expectedRange: '24+',
            detectedVersion: null,
            satisfied: true
          }
        ]
      })
    )

    expect(plan.selectedServiceOptions).toEqual([
      expect.objectContaining({
        optionId: 'local-instance'
      })
    ])
    expect(plan.steps.map((step) => step.id)).toEqual([
      'install',
      'start-postgres',
      'migrate',
      'start-app'
    ])
    expect(plan.steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'install', status: 'ready', dependsOn: [] }),
        expect.objectContaining({
          id: 'start-postgres',
          status: 'skipped',
          dependsOn: ['install']
        }),
        expect.objectContaining({
          id: 'migrate',
          status: 'pending',
          dependsOn: ['install', 'start-postgres']
        })
      ])
    )
  })

  it('surfaces blockers before unsafe work and blocks downstream steps with reasons', () => {
    const plan = buildPlan(
      loaded.spec,
      createRepoInspection({
        missingEvidence: ['migration-step']
      }),
      createMachineInspection({
        tools: [
          {
            name: 'node',
            required: true,
            relevant: true,
            expectedRange: '20.x',
            detectedVersion: 'v18.17.0',
            satisfied: false
          },
          createMachineInspection().tools[1],
          createMachineInspection().tools[2]
        ],
        envFiles: [
          {
            path: '.env',
            exists: false,
            example: '.env.example'
          }
        ],
        envVars: [
          {
            name: 'DATABASE_URL',
            source: '.env.example',
            present: false
          },
          {
            name: 'PORT',
            source: '.env.example',
            present: false
          }
        ]
      })
    )

    expect(plan.blockers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'tool:node',
          factRefs: expect.arrayContaining([expect.objectContaining({ id: 'fact:machine:tool:node' })])
        }),
        expect.objectContaining({
          id: 'repo:migration-step',
          factRefs: expect.arrayContaining([
            expect.objectContaining({ id: 'fact:repo:migration-step-declared', state: 'missing' })
          ])
        }),
        expect.objectContaining({
          id: 'env-file:.env',
          factRefs: expect.arrayContaining([expect.objectContaining({ id: 'fact:machine:env-file:.env' })])
        })
      ])
    )
    expect(plan.steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'install', status: 'blocked' }),
        expect.objectContaining({ id: 'migrate', status: 'blocked' }),
        expect.objectContaining({ id: 'start-app', status: 'blocked' })
      ])
    )
  })

  it('chooses the compose branch when local postgres is unavailable but compose is viable', () => {
    const plan = buildPlan(
      loaded.spec,
      createRepoInspection(),
      createMachineInspection({
        services: [
          {
            serviceName: 'postgres',
            target: 'localhost:5432',
            reachable: false
          }
        ]
      })
    )

    expect(plan.selectedServiceOptions).toEqual([
      expect.objectContaining({
        optionId: 'docker-compose'
      })
    ])
    expect(plan.steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'start-postgres',
          status: 'pending'
        })
      ])
    )
  })

  it('emits deterministic contradiction records for declared-vs-observed service option mismatch', () => {
    const plan = buildPlan(
      loaded.spec,
      createRepoInspection({
        serviceOptions: [
          {
            serviceName: 'postgres',
            optionId: 'docker-compose',
            type: 'docker-compose',
            viable: false,
            reason: 'repo is missing docker compose hints'
          },
          {
            serviceName: 'postgres',
            optionId: 'local-instance',
            type: 'existing',
            viable: true,
            reason: 'existing option available'
          }
        ],
        facts: [
          ...createRepoInspection().facts.filter(
            (fact) =>
              !fact.id.includes('service-option:docker-compose:declared') &&
              !fact.id.includes('service-option:docker-compose:viability')
          ),
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
        ]
      }),
      createMachineInspection({
        tools: [
          createMachineInspection().tools[0],
          createMachineInspection().tools[1],
          {
            name: 'docker',
            required: false,
            relevant: true,
            expectedRange: '24+',
            detectedVersion: null,
            satisfied: false
          }
        ],
        services: [
          {
            serviceName: 'postgres',
            target: 'localhost:5432',
            reachable: false
          }
        ]
      })
    )

    expect(plan.contradictions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'contradiction:service-option:docker-compose:declared-vs-observed',
          declaredFactId: 'fact:repo:service-option:docker-compose:declared',
          observedFactId: 'fact:repo:service-option:docker-compose:viability',
          affectsStepIds: expect.arrayContaining(['start-postgres', 'migrate', 'start-app'])
        })
      ])
    )
    expect(plan.blockers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'service:postgres',
          contradictionRefs: expect.arrayContaining([
            'contradiction:service-option:docker-compose:declared-vs-observed'
          ])
        })
      ])
    )
  })

  it('retains structured satisfied fact provenance alongside legacy satisfiedFacts strings', () => {
    const plan = buildPlan(loaded.spec, createRepoInspection(), createMachineInspection())

    expect(plan.satisfiedFacts).toContain('repo:package-json')
    expect(plan.satisfiedFactRefs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'fact:repo:package-json',
          source: 'observed-repo',
          state: 'satisfied'
        }),
        expect.objectContaining({
          id: 'fact:machine:tool:node',
          source: 'observed-machine',
          state: 'satisfied'
        })
      ])
    )
  })
})
