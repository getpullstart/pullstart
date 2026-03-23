import { accessSync, constants } from 'node:fs'
import { resolve } from 'node:path'

import type { SessionInspectionResult } from '../capability/capability-types.js'
import type { FactRecord, UnknownEvidence } from '../evidence/evidence-types.js'

interface SessionInspectorOptions {
  isWritablePath?: (path: string) => boolean
}

function checkPathWritable(path: string) {
  try {
    accessSync(path, constants.W_OK)
    return true
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      typeof error.code === 'string' &&
      ['EACCES', 'EPERM', 'EROFS'].includes(error.code)
    ) {
      return false
    }

    throw error
  }
}

export function inspectSession(
  repoRoot: string,
  options: SessionInspectorOptions = {}
): SessionInspectionResult {
  const absoluteRoot = resolve(repoRoot)
  const isWritablePath = options.isWritablePath ?? checkPathWritable
  const repoRootWritable = isWritablePath(absoluteRoot)
  const unknownEvidence: UnknownEvidence[] = [
    {
      id: 'unknown:auth:registry',
      source: 'inferred',
      scope: 'auth',
      state: 'unresolved-until-execution',
      rationale: 'registry authentication cannot be proven until dependency install is attempted',
      affectsStepIds: ['install']
    },
    {
      id: 'unknown:network:registry',
      source: 'inferred',
      scope: 'network',
      state: 'unresolved-until-execution',
      rationale: 'network reachability for package install cannot be proven pre-execution',
      affectsStepIds: ['install']
    }
  ]
  const facts: FactRecord[] = [
    {
      id: 'fact:session:repo-root-writable',
      source: 'observed-machine',
      subject: 'permissions.repoRootWritable',
      state: repoRootWritable ? 'satisfied' : 'missing',
      summary: repoRootWritable ? 'Repo root is writable' : 'Repo root is not writable',
      affectsStepIds: ['install', 'migrate', 'start-app']
    }
  ]

  return {
    repoRoot: absoluteRoot,
    permissions: {
      repoRootWritable
    },
    unknowns: ['auth', 'network'],
    unknownEvidence,
    facts,
    blockers: repoRootWritable ? [] : ['permission:repo-root-not-writable']
  }
}
