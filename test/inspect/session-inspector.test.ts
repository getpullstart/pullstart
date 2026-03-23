import { describe, expect, it } from 'vitest'

import { inspectSession } from '../../src/inspect/session-inspector.js'

describe('CAP-02 inspectSession', () => {
  it('reports writable repo root without mutating repository state', () => {
    const result = inspectSession('/tmp/proof-repo', {
      isWritablePath: () => true
    })

    expect(result.permissions.repoRootWritable).toBe(true)
    expect(result.blockers).toEqual([])
  })

  it('keeps auth and network as explicit unknowns while reporting known permissions', () => {
    const result = inspectSession('/tmp/proof-repo', {
      isWritablePath: () => false
    })

    expect(result.permissions.repoRootWritable).toBe(false)
    expect(result.unknowns).toEqual(['auth', 'network'])
    expect(result.blockers).toEqual(['permission:repo-root-not-writable'])
  })

  it('does not collapse unknown auth and network into blocked by default', () => {
    const result = inspectSession('/tmp/proof-repo', {
      isWritablePath: () => true
    })

    expect(result.unknowns).toContain('auth')
    expect(result.unknowns).toContain('network')
    expect(result.blockers).not.toContain('auth')
    expect(result.blockers).not.toContain('network')
  })
})
