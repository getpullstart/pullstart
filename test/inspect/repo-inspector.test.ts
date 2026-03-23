import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { loadSetupSpec } from '../../src/contract/load-setup-spec.js'
import { inspectRepo } from '../../src/inspect/repo-inspector.js'

const rootDir = resolve(import.meta.dirname, '..', '..')
const examplePath = resolve(rootDir, 'contracts/setup.spec.example.yaml')
const loaded = loadSetupSpec(examplePath)

const tempDirs: string[] = []

function createRepoFixture(options?: {
  includePackageJson?: boolean
  includeEnvExample?: boolean
  includeComposeHint?: boolean
  includeMigrationScript?: boolean
  includeStartScript?: boolean
}) {
  const dir = mkdtempSync(resolve(tmpdir(), 'pullstart-repo-'))
  const settings = {
    includePackageJson: true,
    includeEnvExample: true,
    includeComposeHint: true,
    includeMigrationScript: true,
    includeStartScript: true,
    ...options
  }

  if (settings.includePackageJson) {
    const scripts: Record<string, string> = {}

    if (settings.includeMigrationScript) {
      scripts['db:migrate'] = 'prisma migrate deploy'
    }

    if (settings.includeStartScript) {
      scripts.dev = 'node server.js'
    }

    writeFileSync(
      resolve(dir, 'package.json'),
      JSON.stringify(
        {
          name: 'proof-repo',
          private: true,
          scripts
        },
        null,
        2
      )
    )
  }

  if (settings.includeEnvExample) {
    writeFileSync(
      resolve(dir, '.env.example'),
      'DATABASE_URL=postgres://localhost/app\nPORT=3000\n'
    )
  }

  if (settings.includeComposeHint) {
    writeFileSync(resolve(dir, 'docker-compose.yml'), 'services:\n  postgres:\n    image: postgres:16\n')
  }

  tempDirs.push(dir)
  return dir
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { force: true, recursive: true })
  }
})

describe('PLAN-01 inspectRepo', () => {
  it('reports proof-boundary evidence as present for a matching fixture repo', () => {
    const repoDir = createRepoFixture()
    const result = inspectRepo(loaded.spec, repoDir)

    expect(result.presentEvidence).toEqual(
      expect.arrayContaining([
        'package-json',
        'env-example',
        'install-step',
        'migration-step',
        'start-step',
        'verify-target',
        'compose-hint'
      ])
    )
    expect(result.missingEvidence).toEqual([])
    expect(result.serviceOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          optionId: 'docker-compose',
          viable: true
        }),
        expect.objectContaining({
          optionId: 'local-instance',
          viable: true
        })
      ])
    )
    expect(result.facts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'fact:repo:package-json',
          source: 'observed-repo',
          state: 'satisfied'
        }),
        expect.objectContaining({
          id: 'fact:repo:service-option:docker-compose:declared',
          source: 'declared',
          state: 'satisfied'
        }),
        expect.objectContaining({
          id: 'fact:repo:service-option:docker-compose:viability',
          source: 'inferred',
          state: 'satisfied'
        })
      ])
    )
  })

  it('reports missing repo evidence instead of guessing around it', () => {
    const repoDir = createRepoFixture({
      includeEnvExample: false,
      includeMigrationScript: false,
      includeStartScript: false
    })
    const result = inspectRepo(loaded.spec, repoDir)

    expect(result.missingEvidence).toEqual(
      expect.arrayContaining(['env-example', 'migration-step', 'start-step'])
    )
    expect(result.facts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'fact:repo:migration-step-declared',
          source: 'declared',
          state: 'missing'
        }),
        expect.objectContaining({
          id: 'fact:repo:start-step-declared',
          source: 'declared',
          state: 'missing'
        })
      ])
    )
  })

  it('marks compose option unavailable when repo compose hints are absent', () => {
    const repoDir = createRepoFixture({ includeComposeHint: false })
    const result = inspectRepo(loaded.spec, repoDir)

    expect(result.serviceOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          optionId: 'docker-compose',
          viable: false
        }),
        expect.objectContaining({
          optionId: 'local-instance',
          viable: true
        })
      ])
    )
    expect(result.facts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'fact:repo:compose-hint-observed',
          source: 'observed-repo',
          state: 'missing'
        }),
        expect.objectContaining({
          id: 'fact:repo:service-option:docker-compose:viability',
          source: 'inferred',
          state: 'missing'
        })
      ])
    )
  })
})
