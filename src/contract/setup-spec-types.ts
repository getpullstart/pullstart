export interface RepoMetadata {
  name: string
  description: string
}

export interface ToolRequirement {
  name: string
  version: string
  required: boolean
  notes?: string
}

export interface ServiceOption {
  id: string
  type: 'docker-compose' | 'existing'
  command?: string
  note?: string
}

export interface ServiceHealthcheck {
  type: 'tcp'
  target: string
}

export interface ServiceRequirement {
  name: string
  kind: 'postgres'
  required: true
  strategy: 'one_of'
  options: ServiceOption[]
  healthcheck: ServiceHealthcheck
}

export interface EnvFileRequirement {
  path: string
  example: string
}

export interface EnvVarRequirement {
  name: string
  source: string
  description?: string
}

export interface EnvRequirements {
  required_files: EnvFileRequirement[]
  required_vars: EnvVarRequirement[]
}

export interface SetupStep {
  id: string
  name: string
  run: string
  notes?: string
}

export interface VerificationStep {
  id: string
  name: string
  type: 'http'
  target: string
  expect_status: number
}

export interface SetupSpec {
  version: 0
  repo: RepoMetadata
  tools: ToolRequirement[]
  services: ServiceRequirement[]
  env: EnvRequirements
  steps: SetupStep[]
  verify: VerificationStep[]
}

export interface LoadedSetupSpec {
  absolutePath: string
  spec: SetupSpec
}
