import { describe, expect, it } from 'vitest'

import { renderPlan } from '../../src/planner/render-plan.js'

describe('renderPlan', () => {
  it('keeps blockers and dependencies legible in the rendered summary', () => {
    const rendered = renderPlan({
      blockers: [
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
    expect(rendered).toContain('env-file:.env')
    expect(rendered).toContain('Selected service path:')
    expect(rendered).toContain('[blocked] migrate')
    expect(rendered).toContain('depends on install')
  })
})
