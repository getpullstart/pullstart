import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { loadSetupSpec } from '../../src/contract/load-setup-spec.js'
import { inspectMachine } from '../../src/inspect/machine-inspector.js'
import type { RepoInspectionResult } from '../../src/inspect/repo-inspector.js'

const rootDir = resolve(import.meta.dirname, '..', '..')
const examplePath = resolve(rootDir, 'contracts/setup.spec.example.yaml')
const loaded = loadSetupSpec(examplePath)

const tempDirs: string[] = []

function createRepoFixture(envContents?: string) {
  const dir = mkdtempSync(resolve(tmpdir(), 'pullstart-machine-'))

  if (envContents !== undefined) {
    writeFileSync(resolve(dir, '.env'), envContents)
  }

  tempDirs.push(dir)
  return dir
}

function repoInspection(composeViable: boolean): RepoInspectionResult {
  return {
    repoRoot: '/tmp/proof-repo',
    packageJsonPresent: true,
    envExamplePresent: true,
    verificationTargets: loaded.spec.verify,
    presentEvidence: [],
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
        viable: composeViable,
        reason: composeViable ? 'compose hints present in repo' : 'repo missing compose hints'
      },
      {
        serviceName: 'postgres',
        optionId: 'local-instance',
        type: 'existing',
        viable: true,
        reason: 'existing service option available'
      }
    ]
  }
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { force: true, recursive: true })
  }
})

describe('PLAN-02 inspectMachine', () => {
  it('marks required tools as satisfied only when versions match the contract', async () => {
    const repoDir = createRepoFixture('DATABASE_URL=postgres://localhost/app\nPORT=3000\n')
    const result = await inspectMachine(loaded.spec, repoDir, {
      repoInspection: repoInspection(true),
      getVersion: (tool) =>
        ({
          node: 'v20.11.1',
          pnpm: '9.12.0',
          docker: '24.0.7'
        })[tool] ?? null,
      tcpProbe: async () => true
    })

    expect(result.blockers).toEqual([])
    expect(result.tools).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'node', satisfied: true }),
        expect.objectContaining({ name: 'pnpm', satisfied: true }),
        expect.objectContaining({ name: 'docker', relevant: true, satisfied: true })
      ])
    )
  })

  it('reports missing env files and vars before execution is considered safe', async () => {
    const repoDir = createRepoFixture()
    const result = await inspectMachine(loaded.spec, repoDir, {
      repoInspection: repoInspection(false),
      getVersion: (tool) =>
        ({
          node: 'v20.11.1',
          pnpm: '9.12.0',
          docker: null
        })[tool] ?? null,
      tcpProbe: async () => true
    })

    expect(result.blockers).toEqual(
      expect.arrayContaining(['env-file:.env', 'env-var:DATABASE_URL', 'env-var:PORT'])
    )
    expect(result.tools).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'docker', relevant: false, satisfied: true })
      ])
    )
  })

  it('checks postgres reachability through the declared TCP target', async () => {
    const repoDir = createRepoFixture('DATABASE_URL=postgres://localhost/app\nPORT=3000\n')
    const result = await inspectMachine(loaded.spec, repoDir, {
      repoInspection: repoInspection(false),
      getVersion: (tool) =>
        ({
          node: 'v18.17.0',
          pnpm: '9.12.0',
          docker: null
        })[tool] ?? null,
      tcpProbe: async () => false
    })

    expect(result.blockers).toEqual(
      expect.arrayContaining(['tool:node', 'service:postgres'])
    )
    expect(result.services).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          serviceName: 'postgres',
          target: 'localhost:5432',
          reachable: false
        })
      ])
    )
  })
})
