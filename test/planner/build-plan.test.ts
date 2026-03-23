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
        expect.objectContaining({ id: 'tool:node' }),
        expect.objectContaining({ id: 'repo:migration-step' }),
        expect.objectContaining({ id: 'env-file:.env' })
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
})
