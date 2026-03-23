import { describe, expect, it } from 'vitest'

import { classifyPlannerBlocker, classifyRuntimeBlocker } from '../../src/blockers/classify-blocker.js'

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

  it('maps external-access auth blockers into deterministic families', () => {
    const authMissing = classifyPlannerBlocker({
      id: 'auth:registry-missing',
      scope: 'repo',
      message: 'registry auth token is missing',
      stepIds: ['install']
    })

    const authUsabilityUnknown = classifyPlannerBlocker({
      id: 'unknown:auth:registry',
      scope: 'repo',
      message: 'registry authentication usability is unresolved until execution',
      stepIds: ['install']
    })

    expect(authMissing.category).toBe('external-access')
    expect(authMissing.family).toBe('auth-missing')
    expect(authUsabilityUnknown.category).toBe('external-access')
    expect(authUsabilityUnknown.family).toBe('auth-usable-unknown')
  })
})

describe('classifyRuntimeBlocker', () => {
  it('maps structured runtime details to deterministic external-access families', () => {
    const registryPermission = classifyRuntimeBlocker({
      reason: 'step install failed',
      eventType: 'step-failed',
      details: {
        stderr: 'npm ERR! code E403 permission denied while requesting private registry package'
      }
    })

    const vpnRequired = classifyRuntimeBlocker({
      reason: 'step install failed',
      eventType: 'step-failed',
      details: {
        stderr: 'VPN connection required to reach internal registry host'
      }
    })

    const networkUnreachable = classifyRuntimeBlocker({
      reason: 'step install failed',
      eventType: 'step-failed',
      details: {
        error: 'getaddrinfo ENOTFOUND registry.npmjs.org'
      }
    })

    const privateDependencyMissing = classifyRuntimeBlocker({
      reason: 'step install failed',
      eventType: 'step-failed',
      details: {
        stderr: 'No matching version found for @acme/private-dependency'
      }
    })

    expect(registryPermission.category).toBe('external-access')
    expect(registryPermission.family).toBe('registry-permission-denied')
    expect(vpnRequired.category).toBe('external-access')
    expect(vpnRequired.family).toBe('vpn-required-or-unreachable')
    expect(networkUnreachable.category).toBe('external-access')
    expect(networkUnreachable.family).toBe('network-unreachable')
    expect(privateDependencyMissing.category).toBe('external-access')
    expect(privateDependencyMissing.family).toBe('private-dependency-missing')
  })

  it('prefers structured cues over reason text for deterministic external family mapping', () => {
    const input = {
      reason: 'service postgres is not reachable',
      eventType: 'step-failed' as const,
      details: {
        stderr: 'npm ERR! code E403 permission denied at private registry'
      }
    }

    const first = classifyRuntimeBlocker(input)
    const second = classifyRuntimeBlocker(input)

    expect(first.category).toBe('external-access')
    expect(first.family).toBe('registry-permission-denied')
    expect(first).toEqual(second)
  })
})
