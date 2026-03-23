import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import dotenv from 'dotenv'

import type { SetupSpec } from '../contract/setup-spec-types.js'
import type { RepoInspectionResult } from './repo-inspector.js'
import { getCommandVersion, satisfiesVersion, tcpReachable } from './probe-utils.js'

export interface ToolInspectionResult {
  name: string
  required: boolean
  relevant: boolean
  expectedRange: string
  detectedVersion: string | null
  satisfied: boolean
}

export interface EnvFileInspectionResult {
  path: string
  exists: boolean
  example: string
}

export interface EnvVarInspectionResult {
  name: string
  source: string
  present: boolean
}

export interface ServiceHealthInspectionResult {
  serviceName: string
  target: string
  reachable: boolean
}

export interface MachineInspectionResult {
  repoRoot: string
  tools: ToolInspectionResult[]
  envFiles: EnvFileInspectionResult[]
  envVars: EnvVarInspectionResult[]
  services: ServiceHealthInspectionResult[]
  blockers: string[]
}

interface MachineInspectorOptions {
  repoInspection?: RepoInspectionResult
  getVersion?: typeof getCommandVersion
  tcpProbe?: typeof tcpReachable
}

function parseTcpTarget(target: string) {
  const [host, port] = target.split(':')
  return {
    host,
    port: Number(port)
  }
}

function toolRelevant(toolName: string, repoInspection?: RepoInspectionResult) {
  if (toolName !== 'docker') {
    return true
  }

  return (
    repoInspection?.serviceOptions.some(
      (option) => option.type === 'docker-compose' && option.viable
    ) ?? false
  )
}

export async function inspectMachine(
  spec: SetupSpec,
  repoRoot: string,
  options: MachineInspectorOptions = {}
): Promise<MachineInspectionResult> {
  const absoluteRoot = resolve(repoRoot)
  const getVersion = options.getVersion ?? getCommandVersion
  const tcpProbe = options.tcpProbe ?? tcpReachable

  const tools = spec.tools.map((tool) => {
    const relevant = tool.required || toolRelevant(tool.name, options.repoInspection)
    const detectedVersion = relevant ? getVersion(tool.name) : null
    const satisfied = relevant
      ? satisfiesVersion(detectedVersion, tool.version)
      : true

    return {
      name: tool.name,
      required: tool.required,
      relevant,
      expectedRange: tool.version,
      detectedVersion,
      satisfied
    } satisfies ToolInspectionResult
  })

  const envFiles = spec.env.required_files.map((file) => ({
    path: file.path,
    example: file.example,
    exists: existsSync(resolve(absoluteRoot, file.path))
  }))

  const primaryEnvFile = envFiles[0]
  const envValues =
    primaryEnvFile && primaryEnvFile.exists
      ? dotenv.parse(readFileSync(resolve(absoluteRoot, primaryEnvFile.path), 'utf8'))
      : {}

  const envVars = spec.env.required_vars.map((variable) => ({
    name: variable.name,
    source: variable.source,
    present: Boolean(envValues[variable.name])
  }))

  const services = await Promise.all(
    spec.services.map(async (service) => {
      const target = parseTcpTarget(service.healthcheck.target)
      const reachable = await tcpProbe(target.host, target.port)

      return {
        serviceName: service.name,
        target: service.healthcheck.target,
        reachable
      } satisfies ServiceHealthInspectionResult
    })
  )

  const blockers: string[] = []

  for (const tool of tools) {
    if (tool.relevant && !tool.satisfied) {
      blockers.push(`tool:${tool.name}`)
    }
  }

  for (const envFile of envFiles) {
    if (!envFile.exists) {
      blockers.push(`env-file:${envFile.path}`)
    }
  }

  for (const envVar of envVars) {
    if (!envVar.present) {
      blockers.push(`env-var:${envVar.name}`)
    }
  }

  for (const service of services) {
    if (!service.reachable) {
      blockers.push(`service:${service.serviceName}`)
    }
  }

  return {
    repoRoot: absoluteRoot,
    tools,
    envFiles,
    envVars,
    services,
    blockers
  }
}
