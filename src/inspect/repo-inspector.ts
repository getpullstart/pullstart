import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type {
  ServiceOption,
  SetupSpec,
  VerificationStep
} from '../contract/setup-spec-types.js'

export interface RepoServiceOptionStatus {
  serviceName: string
  optionId: string
  type: ServiceOption['type']
  viable: boolean
  reason: string
}

export interface RepoInspectionResult {
  repoRoot: string
  packageJsonPresent: boolean
  envExamplePresent: boolean
  verificationTargets: VerificationStep[]
  presentEvidence: string[]
  missingEvidence: string[]
  scripts: {
    install: boolean
    migrate: boolean
    start: boolean
  }
  serviceOptions: RepoServiceOptionStatus[]
}

function loadPackageScripts(repoRoot: string) {
  const packageJsonPath = resolve(repoRoot, 'package.json')

  if (!existsSync(packageJsonPath)) {
    return null
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
    scripts?: Record<string, string>
  }

  return packageJson.scripts ?? {}
}

function scriptExists(command: string, scripts: Record<string, string>) {
  const match = command.match(/^pnpm\s+([a-zA-Z0-9:_-]+)$/)

  if (!match) {
    return true
  }

  return match[1] in scripts
}

function detectComposeHint(repoRoot: string) {
  const candidates = [
    'docker-compose.yml',
    'docker-compose.yaml',
    'compose.yml',
    'compose.yaml'
  ]

  return candidates.some((candidate) => existsSync(resolve(repoRoot, candidate)))
}

export function inspectRepo(spec: SetupSpec, repoRoot: string): RepoInspectionResult {
  const absoluteRoot = resolve(repoRoot)
  const scripts = loadPackageScripts(absoluteRoot)
  const packageJsonPresent = scripts !== null
  const envExample = spec.env.required_files[0]?.example
  const envExamplePresent = envExample
    ? existsSync(resolve(absoluteRoot, envExample))
    : false

  const installStep = spec.steps.find((step) => step.id === 'install')
  const migrateStep = spec.steps.find((step) => step.id === 'migrate')
  const startStep = spec.steps.find((step) => step.id === 'start-app')

  const scriptEvidence = {
    install: packageJsonPresent && Boolean(installStep),
    migrate:
      packageJsonPresent && Boolean(migrateStep) && scriptExists(migrateStep.run, scripts ?? {}),
    start:
      packageJsonPresent && Boolean(startStep) && scriptExists(startStep.run, scripts ?? {})
  }

  const presentEvidence: string[] = []
  const missingEvidence: string[] = []

  if (packageJsonPresent) {
    presentEvidence.push('package-json')
  } else {
    missingEvidence.push('package-json')
  }

  if (envExamplePresent) {
    presentEvidence.push('env-example')
  } else {
    missingEvidence.push('env-example')
  }

  if (scriptEvidence.install) {
    presentEvidence.push('install-step')
  } else {
    missingEvidence.push('install-step')
  }

  if (scriptEvidence.migrate) {
    presentEvidence.push('migration-step')
  } else {
    missingEvidence.push('migration-step')
  }

  if (scriptEvidence.start) {
    presentEvidence.push('start-step')
  } else {
    missingEvidence.push('start-step')
  }

  if (spec.verify.length > 0) {
    presentEvidence.push('verify-target')
  } else {
    missingEvidence.push('verify-target')
  }

  const composeHintPresent = detectComposeHint(absoluteRoot)
  if (composeHintPresent) {
    presentEvidence.push('compose-hint')
  }

  const serviceOptions = spec.services.flatMap((service) =>
    service.options.map((option) => {
      if (option.type === 'docker-compose') {
        return {
          serviceName: service.name,
          optionId: option.id,
          type: option.type,
          viable: composeHintPresent,
          reason: composeHintPresent
            ? 'compose hints present in repo'
            : 'repo is missing docker compose hints'
        } satisfies RepoServiceOptionStatus
      }

      return {
        serviceName: service.name,
        optionId: option.id,
        type: option.type,
        viable: true,
        reason: 'existing service option does not require repo-managed compose files'
      } satisfies RepoServiceOptionStatus
    })
  )

  return {
    repoRoot: absoluteRoot,
    packageJsonPresent,
    envExamplePresent,
    verificationTargets: spec.verify,
    presentEvidence,
    missingEvidence,
    scripts: scriptEvidence,
    serviceOptions
  }
}
