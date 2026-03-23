import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { parseDocument } from 'yaml'

import type { LoadedSetupSpec, SetupSpec } from './setup-spec-types.js'

const rootDir = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const schemaPath = resolve(rootDir, 'contracts/setup.spec.schema.json')

const ajv = new Ajv2020({
  allErrors: true,
  strict: true
})

addFormats(ajv)

const validateSetupSpec = ajv.compile<SetupSpec>(
  JSON.parse(readFileSync(schemaPath, 'utf8'))
)

export class SetupSpecLoaderError extends Error {
  override name = 'SetupSpecLoaderError'
}

export function loadSetupSpec(path: string): LoadedSetupSpec {
  const absolutePath = resolve(path)
  const source = readFileSync(absolutePath, 'utf8')
  const document = parseDocument(source, {
    prettyErrors: true,
    strict: true,
    uniqueKeys: true
  })

  if (document.errors.length > 0) {
    throw new SetupSpecLoaderError(
      `Failed to parse setup spec at ${absolutePath}: ${document.errors[0].message}`
    )
  }

  const spec = document.toJS() as SetupSpec

  if (!validateSetupSpec(spec)) {
    const details = (validateSetupSpec.errors ?? [])
      .map((error) => {
        const location = error.instancePath || '/'
        return `${location} ${error.message}`
      })
      .join('; ')

    throw new SetupSpecLoaderError(
      `setup spec schema validation failed for ${absolutePath}: ${details}`
    )
  }

  return {
    absolutePath,
    spec
  }
}
