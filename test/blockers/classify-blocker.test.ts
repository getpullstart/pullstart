import { describe, expect, it } from 'vitest'

import { classifyPlannerBlocker } from '../../src/blockers/classify-blocker.js'

describe('classifyPlannerBlocker', () => {
  it('maps tool and env scopes to machine-prerequisite', () => {
    expect(
      classifyPlannerBlocker({
        id: 'tool:node',
        scope: 'tool',
        message: 'node missing',
        stepIds: ['install']
      }).category
    ).toBe('machine-prerequisite')

    expect(
      classifyPlannerBlocker({
        id: 'env-file:.env',
        scope: 'env-file',
        message: 'env file missing',
        stepIds: ['migrate']
      }).category
    ).toBe('machine-prerequisite')

    expect(
      classifyPlannerBlocker({
        id: 'env-var:DATABASE_URL',
        scope: 'env-var',
        message: 'env var missing',
        stepIds: ['migrate']
      }).category
    ).toBe('machine-prerequisite')
  })

  it('maps service scope to service-health', () => {
    const classified = classifyPlannerBlocker({
      id: 'service:postgres',
      scope: 'service',
      message: 'postgres unreachable',
      stepIds: ['migrate']
    })

    expect(classified.category).toBe('service-health')
    expect(classified.nextAction).toContain('service')
  })

  it('maps repo scope to repo-setup and stays deterministic', () => {
    const input = {
      id: 'repo:migration-step',
      scope: 'repo' as const,
      message: 'migration script missing',
      stepIds: ['migrate']
    }

    const first = classifyPlannerBlocker(input)
    const second = classifyPlannerBlocker(input)

    expect(first.category).toBe('repo-setup')
    expect(first).toEqual(second)
    expect(first.nextAction.length).toBeGreaterThan(0)
  })
})

