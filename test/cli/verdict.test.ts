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
    const buildPlan = vi.fn(() => ({ blockers: [], selectedServiceOptions: [], satisfiedFacts: [], steps: [] }))
    const inspectSession = vi.fn(() => ({
      repoRoot: '/tmp/proof-repo',
      permissions: { repoRootWritable: true },
      unknowns: ['auth', 'network'],
      blockers: []
    }))
    const buildCapabilityVerdict = vi.fn(() => ({
      decision: 'needs-user-action',
      nextStepId: 'install',
      requiredUserAction: 'Install Node.js 20.x',
      checks: [],
      caveats: ['Network reachability is unknown.']
    }))
    const renderCapabilityVerdict = vi.fn(() =>
      [
        'Pullstart capability verdict',
        'Decision: needs-user-action',
        'Next action: Install Node.js 20.x',
        'Caveats:',
        '- Unknown: Network reachability is unknown'
      ].join('\n')
    )
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

    const output = writes.join('')
    expect(loadSetupSpec).toHaveBeenCalledWith('/tmp/proof-repo/setup.spec.yaml')
    expect(inspectRepo).toHaveBeenCalledTimes(1)
    expect(inspectMachine).toHaveBeenCalledTimes(1)
    expect(buildPlan).toHaveBeenCalledTimes(1)
    expect(inspectSession).toHaveBeenCalledTimes(1)
    expect(buildCapabilityVerdict).toHaveBeenCalledTimes(1)
    expect(renderCapabilityVerdict).toHaveBeenCalledTimes(1)
    expect(forbidden).not.toHaveBeenCalled()
    expect(output).toContain('"decision": "needs-user-action"')
    expect(output).toContain('Next action: Install Node.js 20.x')
    expect(output).toContain('Unknown: Network reachability is unknown')
  })
})
