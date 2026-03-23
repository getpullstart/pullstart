import { describe, expect, it } from 'vitest'

import { renderPlan } from '../../src/planner/render-plan.js'

describe('renderPlan', () => {
  it('keeps blockers and dependencies legible in the rendered summary', () => {
    const rendered = renderPlan({
      blockers: [
        {
          id: 'tool:node',
          scope: 'tool',
          message: 'Required tool node does not satisfy 20.x.',
          stepIds: ['install']
        },
        {
          id: 'service:postgres',
          scope: 'service',
          message: 'Service postgres is not reachable at localhost:5432.',
          stepIds: ['migrate', 'start-app']
        },
        {
          id: 'env-file:.env',
          scope: 'env-file',
          message: 'Missing env file .env; expected template .env.example.',
          stepIds: ['migrate', 'start-app']
        }
      ],
      selectedServiceOptions: [
        {
          serviceName: 'postgres',
          optionId: 'local-instance',
          reason: 'existing local service is already reachable'
        }
      ],
      satisfiedFacts: ['tool:node'],
      steps: [
        {
          id: 'install',
          name: 'Install dependencies',
          run: 'pnpm install',
          status: 'ready',
          dependsOn: []
        },
        {
          id: 'migrate',
          name: 'Run database migrations',
          run: 'pnpm db:migrate',
          status: 'blocked',
          dependsOn: ['install'],
          reason: 'resolve blockers before this step is safe to run'
        }
      ]
    })

    expect(rendered).toContain('Blockers:')
    expect(rendered).toContain('tool:node [machine-prerequisite]')
    expect(rendered).toContain('service:postgres [service-health]')
    expect(rendered).toContain('env-file:.env [machine-prerequisite]')
    expect(rendered).toContain('Next action:')
    expect(rendered).toContain('Selected service path:')
    expect(rendered).toContain('[blocked] migrate')
    expect(rendered).toContain('depends on install')
  })
})
