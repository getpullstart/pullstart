import type { RunOutcome } from './execution-types.js'
import { classifyRuntimeBlocker } from '../blockers/classify-blocker.js'

function normalizeCaveat(caveat: string) {
  return caveat.trim().replace(/\.$/, '')
}

export function renderRunOutcome(outcome: RunOutcome) {
  const lines: string[] = []

  lines.push('Pullstart run outcome')
  lines.push('')
  lines.push(`Status: ${outcome.status}`)
  lines.push(`Reason: ${outcome.reason}`)

  if (outcome.status === 'blocked') {
    const classificationEvent = [...outcome.events]
      .reverse()
      .find(
        (item) =>
          item.type === 'verification-failed' || item.type === 'step-failed' || item.type === 'blocked'
      )
    const classified = classifyRuntimeBlocker({
      reason: outcome.reason,
      nextAction: outcome.nextAction,
      eventType: classificationEvent?.type as 'verification-failed' | 'step-failed' | 'blocked' | undefined,
      details: classificationEvent?.details
    })
    lines.push(`Category: ${classified.category}`)
    lines.push(`Next action: ${classified.nextAction}`)
  } else if (outcome.nextAction) {
    lines.push(`Next action: ${outcome.nextAction}`)
  }

  lines.push('')
  lines.push(
    `Executed steps: ${outcome.executedStepIds.length > 0 ? outcome.executedStepIds.join(', ') : 'none'}`
  )

  if (outcome.guidedStepId) {
    lines.push(`Guided step: ${outcome.guidedStepId}`)
  }

  if (outcome.caveats.length > 0) {
    lines.push('')
    lines.push('Caveats:')
    for (const caveat of outcome.caveats) {
      lines.push(`- Unknown: ${normalizeCaveat(caveat)}`)
    }
  }

  lines.push('')
  lines.push('Events:')
  for (const item of outcome.events) {
    lines.push(`- ${item.type}${item.stepId ? `(${item.stepId})` : ''}: ${item.message}`)
  }

  return lines.join('\n')
}
