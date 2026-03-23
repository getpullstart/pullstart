import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { describe, expect, it } from 'vitest'
import { parseDocument } from 'yaml'

const root = resolve(import.meta.dirname, '..', '..')
const examplePath = resolve(root, 'contracts/setup.spec.example.yaml')
const schemaPath = resolve(root, 'contracts/setup.spec.schema.json')

function loadExampleContract() {
  const source = readFileSync(examplePath, 'utf8')
  const document = parseDocument(source, {
    prettyErrors: true,
    strict: true,
    uniqueKeys: true
  })

  if (document.errors.length > 0) {
    throw document.errors[0]
  }

  return document.toJS()
}

describe('CNTR-02 contract fixtures', () => {
  it('CNTR-02 validates the canonical setup spec fixture through YAML and Ajv', () => {
    const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))
    const fixture = loadExampleContract()

    const ajv = new Ajv2020({
      allErrors: true,
      strict: true
    })
    addFormats(ajv)

    const validate = ajv.compile(schema)
    const valid = validate(fixture)

    expect(valid, JSON.stringify(validate.errors, null, 2)).toBe(true)
    expect(fixture).toMatchObject({
      version: 0,
      services: [
        expect.objectContaining({
          name: 'postgres'
        })
      ],
      verify: [
        expect.objectContaining({
          type: 'http'
        })
      ]
    })
  })
})
