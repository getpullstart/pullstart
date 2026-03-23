import { spawn } from 'node:child_process'

import type { CommandResult, ExecutionStep } from './execution-types.js'

interface RunFiniteStepOptions {
  runCommand?: typeof spawn
}

function truncateText(text: string, maxLength = 4000) {
  if (text.length <= maxLength) {
    return text
  }

  return text.slice(text.length - maxLength)
}

export async function runFiniteStep(
  repoRoot: string,
  step: ExecutionStep,
  options: RunFiniteStepOptions = {}
): Promise<CommandResult> {
  const runCommand = options.runCommand ?? spawn
  const [command, ...args] = step.run.split(/\s+/)
  const start = Date.now()

  return await new Promise((resolve) => {
    const child = runCommand(command, args, {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    child.stdout?.on('data', (chunk) => {
      stdout += String(chunk)
    })

    child.stderr?.on('data', (chunk) => {
      stderr += String(chunk)
    })

    child.once('error', (error) => {
      resolve({
        status: 'failed',
        exitCode: null,
        stdout: truncateText(stdout),
        stderr: truncateText(`${stderr}\n${error.message}`.trim()),
        durationMs: Date.now() - start
      })
    })

    child.once('exit', (code, signal) => {
      const aborted = signal === 'SIGINT' || signal === 'SIGTERM'

      resolve({
        status: aborted ? 'aborted' : code === 0 ? 'succeeded' : 'failed',
        exitCode: code,
        stdout: truncateText(stdout),
        stderr: truncateText(stderr),
        durationMs: Date.now() - start
      })
    })
  })
}
