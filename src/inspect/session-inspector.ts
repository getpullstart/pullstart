import { accessSync, constants } from 'node:fs'
import { resolve } from 'node:path'

import type { SessionInspectionResult } from '../capability/capability-types.js'

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

  return {
    repoRoot: absoluteRoot,
    permissions: {
      repoRootWritable
    },
    unknowns: ['auth', 'network'],
    blockers: repoRootWritable ? [] : ['permission:repo-root-not-writable']
  }
}
