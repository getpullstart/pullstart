import type { RunOutcome } from './execution-types.js'

export function renderRunOutcome(outcome: RunOutcome) {
  const lines: string[] = []

  lines.push('Pullstart run outcome')
  lines.push('')
  lines.push(`Status: ${outcome.status}`)
  lines.push(`Reason: ${outcome.reason}`)

  if (outcome.nextAction) {
    lines.push(`Next action: ${outcome.nextAction}`)
  }

  lines.push('')
  lines.push(`Executed steps: ${outcome.executedStepIds.length > 0 ? outcome.executedStepIds.join(', ') : 'none'}`)

  if (outcome.guidedStepId) {
    lines.push(`Guided step: ${outcome.guidedStepId}`)
  }

  if (outcome.caveats.length > 0) {
    lines.push('')
    lines.push('Caveats:')
    for (const caveat of outcome.caveats) {
      lines.push(`- ${caveat}`)
    }
  }

  lines.push('')
  lines.push('Events:')
  for (const item of outcome.events) {
    lines.push(`- ${item.type}${item.stepId ? `(${item.stepId})` : ''}: ${item.message}`)
  }

  return lines.join('\n')
}
