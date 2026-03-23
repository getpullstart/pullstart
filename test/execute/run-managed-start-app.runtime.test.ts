import { createServer } from 'node:http'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import net from 'node:net'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { runManagedStartApp } from '../../src/execute/run-managed-start-app.js'

async function getFreePort() {
  return await new Promise<number>((resolvePort, reject) => {
    const server = net.createServer()
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to get free port'))
        return
      }

      const port = address.port
      server.close((error) => {
        if (error) {
          reject(error)
          return
        }
        resolvePort(port)
      })
    })
    server.on('error', reject)
  })
}

async function canConnect(port: number) {
  return await new Promise<boolean>((resolveConnect) => {
    const socket = new net.Socket()

    const finish = (ok: boolean) => {
      socket.destroy()
      resolveConnect(ok)
    }

    socket.setTimeout(150)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
    socket.connect(port, '127.0.0.1')
  })
}

async function waitForClosedPort(port: number, retries = 20) {
  for (let index = 0; index < retries; index += 1) {
    const connected = await canConnect(port)
    if (!connected) {
      return true
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 50))
  }

  return false
}

const tempDirs: string[] = []

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { force: true, recursive: true })
  }
})

describe('runtime managed start-app verification behavior', () => {
  it('succeeds only when managed app reaches declared verification signal and then terminates process', async () => {
    const port = await getFreePort()
    const dir = mkdtempSync(resolve(tmpdir(), 'pullstart-runtime-'))
    tempDirs.push(dir)

    const appScriptPath = resolve(dir, 'app.js')
    writeFileSync(
      appScriptPath,
      [
        "const http = require('node:http')",
        `const port = ${port}`,
        "const server = http.createServer((req, res) => {",
        "  if (req.url === '/health') {",
        "    res.statusCode = 200",
        "    res.end('ok')",
        "    return",
        '  }',
        '  res.statusCode = 404',
        "  res.end('no')",
        '})',
        "server.listen(port, '127.0.0.1')"
      ].join('\n')
    )

    const result = await runManagedStartApp(
      dir,
      `node ${appScriptPath}`,
      {
        id: 'api-health',
        name: 'Health endpoint responds',
        type: 'http',
        target: `http://127.0.0.1:${port}/health`,
        expect_status: 200
      },
      {
        verificationTimeoutMs: 2_000,
        verificationIntervalMs: 50
      }
    )

    expect(result.status).toBe('success')
    expect(result.runtimeEvidence?.some((item) => item.source === 'runtime-observed')).toBe(true)
    expect(result.runtimeEvidence?.some((item) => item.subject.includes('.result'))).toBe(true)

    const closed = await waitForClosedPort(port)
    expect(closed).toBe(true)
  })

  it('treats preexisting healthy target as ambiguous and skips startup process', async () => {
    const port = await getFreePort()

    const existingServer = createServer((_, response) => {
      response.statusCode = 200
      response.end('ok')
    })

    await new Promise<void>((resolveReady, reject) => {
      existingServer.once('error', reject)
      existingServer.listen(port, '127.0.0.1', () => {
        resolveReady()
      })
    })

    const startProcess = vi.fn()

    const result = await runManagedStartApp(
      '/tmp',
      'node /tmp/non-existent.js',
      {
        id: 'api-health',
        name: 'Health endpoint responds',
        type: 'http',
        target: `http://127.0.0.1:${port}/health`,
        expect_status: 200
      },
      {
        startProcess: startProcess as never,
        verificationTimeoutMs: 1_000,
        verificationIntervalMs: 50
      }
    )

    await new Promise<void>((resolveClose) => {
      existingServer.close(() => resolveClose())
    })

    expect(result.status).toBe('blocked')
    expect(result.reason).toContain('ambiguous')
    expect(result.nextAction).toContain('rerun')
    expect(startProcess).not.toHaveBeenCalled()
    expect(result.runtimeEvidence?.[0]?.source).toBe('runtime-observed')
    expect(result.runtimeEvidence?.[0]?.state).toBe('satisfied')
  })
})
