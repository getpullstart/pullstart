import { execFileSync } from 'node:child_process'
import net from 'node:net'

import semver from 'semver'

export function normalizeVersionRange(range: string) {
  if (/^\d+\+$/.test(range)) {
    return `>=${range.slice(0, -1)}.0.0`
  }

  return range
}

export function getCommandVersion(command: string) {
  try {
    return execFileSync(command, ['--version'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim()
  } catch {
    return null
  }
}

export function satisfiesVersion(version: string | null, range: string) {
  if (!version) {
    return false
  }

  const normalized = semver.coerce(version)
  if (!normalized) {
    return false
  }

  return semver.satisfies(normalized, normalizeVersionRange(range))
}

export function tcpReachable(
  host: string,
  port: number,
  timeoutMs = 250
): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket()

    const finish = (result: boolean) => {
      socket.destroy()
      resolve(result)
    }

    socket.setTimeout(timeoutMs)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
    socket.connect(port, host)
  })
}
