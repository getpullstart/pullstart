import { describe, expect, it, vi } from 'vitest'

import { main } from '../../src/cli/verdict.js'

describe('verdict CLI', () => {
  it('prints capability verdict output without executing setup commands', async () => {
    const writes: string[] = []
    const loadSetupSpec = vi.fn(() => ({
      absolutePath: '/tmp/proof-repo/setup.spec.yaml',
      spec: { repo: { name: 'proof-repo' } }
    }))
    const inspectRepo = vi.fn(() => ({ repoInspection: true }))
    const inspectMachine = vi.fn(async () => ({ machineInspection: true }))
    const buildPlan = vi.fn(() => ({
      blockers: [],
      selectedServiceOptions: [],
      satisfiedFacts: [],
      steps: []
    }))
    const inspectSession = vi.fn(() => ({
      repoRoot: '/tmp/proof-repo',
      permissions: { repoRootWritable: true },
      unknowns: ['auth', 'network'],
      blockers: []
    }))
    const buildCapabilityVerdict = vi.fn(() => ({
      decision: 'can-act',
      nextStepId: 'install',
      checks: [],
      caveats: []
    }))
    const renderCapabilityVerdict = vi.fn(() => 'rendered capability verdict')
    const forbidden = vi.fn()

    await main(['--summary'], {
      cwd: () => '/tmp/proof-repo',
      stdout: {
        write(chunk: string) {
          writes.push(chunk)
          return true
        }
      },
      loadSetupSpec,
      inspectRepo,
      inspectMachine,
      buildPlan,
      inspectSession,
      buildCapabilityVerdict,
      renderCapabilityVerdict,
      // @ts-expect-error CLI should ignore any execution-shaped extras
      runBootstrap: forbidden
    })

    expect(loadSetupSpec).toHaveBeenCalledWith('/tmp/proof-repo/setup.spec.yaml')
    expect(inspectRepo).toHaveBeenCalledTimes(1)
    expect(inspectMachine).toHaveBeenCalledTimes(1)
    expect(buildPlan).toHaveBeenCalledTimes(1)
    expect(inspectSession).toHaveBeenCalledTimes(1)
    expect(buildCapabilityVerdict).toHaveBeenCalledTimes(1)
    expect(renderCapabilityVerdict).toHaveBeenCalledTimes(1)
    expect(forbidden).not.toHaveBeenCalled()
    expect(writes.join('')).toContain('"decision": "can-act"')
    expect(writes.join('')).toContain('rendered capability verdict')
  })
})
