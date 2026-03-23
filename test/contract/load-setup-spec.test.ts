import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  SetupSpecLoaderError,
  loadSetupSpec
} from '../../src/contract/load-setup-spec.js'

const rootDir = resolve(import.meta.dirname, '..', '..')
const examplePath = resolve(rootDir, 'contracts/setup.spec.example.yaml')

const tempDirs: string[] = []

function writeTempSpec(source: string) {
  const dir = mkdtempSync(resolve(tmpdir(), 'pullstart-spec-'))
  const file = resolve(dir, 'setup.spec.yaml')
  writeFileSync(file, source)
  tempDirs.push(dir)
  return file
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { force: true, recursive: true })
  }
})

describe('PLAN-01 loadSetupSpec', () => {
  it('loads the canonical fixture through the production loader', () => {
    const loaded = loadSetupSpec(examplePath)

    expect(loaded.absolutePath).toBe(examplePath)
    expect(loaded.spec).toMatchObject({
      version: 0,
      repo: {
        name: 'sample-node-api'
      },
      env: {
        required_files: [
          expect.objectContaining({
            path: '.env'
          })
        ]
      }
    })
  })

  it('fails loudly on YAML parse errors', () => {
    const brokenPath = writeTempSpec('version: [\nrepo:\n  name: broken')

    expect(() => loadSetupSpec(brokenPath)).toThrowError(SetupSpecLoaderError)
    expect(() => loadSetupSpec(brokenPath)).toThrow(/Failed to parse setup spec/)
  })

  it('fails loudly on duplicate keys', () => {
    const duplicatePath = writeTempSpec(
      ['version: 0', 'version: 1', 'repo:', '  name: dup', '  description: dup'].join(
        '\n'
      )
    )

    expect(() => loadSetupSpec(duplicatePath)).toThrow(/Failed to parse setup spec/)
  })

  it('fails loudly on schema violations', () => {
    const invalid = `${readFileSync(examplePath, 'utf8')}\nextra_field: true\n`
    const invalidPath = writeTempSpec(invalid)

    expect(() => loadSetupSpec(invalidPath)).toThrow(/schema validation failed/)
  })
})
