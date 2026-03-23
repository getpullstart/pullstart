import { describe, expect, it, vi } from 'vitest'

import { main } from '../../src/cli/plan.js'

describe('plan CLI', () => {
  it('prints planner output without executing setup commands', async () => {
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
      satisfiedFactRefs: [
        {
          id: 'fact:repo:package-json',
          source: 'observed-repo',
          subject: 'repo.package-json',
          state: 'satisfied',
          summary: 'package.json exists',
          affectsStepIds: ['install']
        }
      ],
      factRefs: [
        {
          id: 'fact:repo:package-json',
          source: 'observed-repo',
          subject: 'repo.package-json',
          state: 'satisfied',
          summary: 'package.json exists',
          affectsStepIds: ['install']
        }
      ],
      contradictions: [
        {
          id: 'contradiction:service-option:docker-compose:declared-vs-observed',
          declaredFactId: 'fact:repo:service-option:postgres:docker-compose:declared',
          observedFactId: 'fact:repo:service-option:postgres:docker-compose:viability',
          summary: 'Declared compose option is not currently viable from observed evidence',
          affectsStepIds: ['start-postgres', 'migrate', 'start-app']
        }
      ],
      steps: []
    }))
    const renderPlan = vi.fn(() => 'rendered plan')
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
      renderPlan,
      // @ts-expect-error the CLI should ignore any execution-shaped extras
      runStep: forbidden
    })

    expect(loadSetupSpec).toHaveBeenCalledWith('/tmp/proof-repo/setup.spec.yaml')
    expect(inspectRepo).toHaveBeenCalledTimes(1)
    expect(inspectMachine).toHaveBeenCalledTimes(1)
    expect(buildPlan).toHaveBeenCalledTimes(1)
    expect(renderPlan).toHaveBeenCalledTimes(1)
    expect(forbidden).not.toHaveBeenCalled()
    expect(writes.join('')).toContain('"steps": []')
    expect(writes.join('')).toContain('"factRefs"')
    expect(writes.join('')).toContain('"contradictions"')
    expect(writes.join('')).toContain('rendered plan')
  })
})
