import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import dotenv from 'dotenv'

import type { SetupSpec } from '../contract/setup-spec-types.js'
import type { FactRecord } from '../evidence/evidence-types.js'
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
  facts: FactRecord[]
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

  const facts: FactRecord[] = [
    ...tools.map((tool) => ({
      id: `fact:machine:tool:${tool.name}`,
      source: 'observed-machine' as const,
      subject: `tool.${tool.name}`,
      state: tool.relevant ? (tool.satisfied ? 'satisfied' : 'missing') : ('unknown' as const),
      summary: tool.relevant
        ? tool.satisfied
          ? `${tool.name} satisfies ${tool.expectedRange}`
          : `${tool.name} does not satisfy ${tool.expectedRange}`
        : `${tool.name} not required for selected path`,
      affectsStepIds:
        tool.name === 'docker'
          ? ['start-postgres', 'migrate', 'start-app']
          : ['install', 'migrate', 'start-app']
    })),
    ...envFiles.map((file) => ({
      id: `fact:machine:env-file:${file.path}`,
      source: 'observed-machine' as const,
      subject: `env-file.${file.path}`,
      state: file.exists ? ('satisfied' as const) : ('missing' as const),
      summary: file.exists ? `${file.path} exists` : `${file.path} is missing`,
      affectsStepIds: ['migrate', 'start-app']
    })),
    ...envVars.map((variable) => ({
      id: `fact:machine:env-var:${variable.name}`,
      source: 'observed-machine' as const,
      subject: `env-var.${variable.name}`,
      state: variable.present ? ('satisfied' as const) : ('missing' as const),
      summary: variable.present
        ? `${variable.name} present in ${variable.source}`
        : `${variable.name} missing from ${variable.source}`,
      affectsStepIds: ['migrate', 'start-app']
    })),
    ...services.map((service) => ({
      id: `fact:machine:service:${service.serviceName}`,
      source: 'observed-machine' as const,
      subject: `service.${service.serviceName}.reachability`,
      state: service.reachable ? ('satisfied' as const) : ('missing' as const),
      summary: service.reachable
        ? `${service.serviceName} reachable at ${service.target}`
        : `${service.serviceName} unreachable at ${service.target}`,
      affectsStepIds: ['migrate', 'start-app']
    }))
  ]

  return {
    repoRoot: absoluteRoot,
    tools,
    envFiles,
    envVars,
    services,
    facts,
    blockers
  }
}
