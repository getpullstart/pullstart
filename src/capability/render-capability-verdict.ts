import type { CapabilityVerdict } from './capability-types.js'

export function renderCapabilityVerdict(verdict: CapabilityVerdict) {
  const lines: string[] = []

  lines.push('Pullstart capability verdict')
  lines.push('')
  lines.push(`Decision: ${verdict.decision}`)
  lines.push(`Next step: ${verdict.nextStepId ?? 'none'}`)

  if (verdict.requiredUserAction) {
    lines.push(`Required user action: ${verdict.requiredUserAction}`)
  }

  lines.push('')
  lines.push('Checks:')
  for (const check of verdict.checks) {
    const affects = check.affectsStepIds.length > 0 ? ` affects ${check.affectsStepIds.join(', ')}` : ''
    lines.push(`- [${check.state}] ${check.domain}: ${check.summary}${affects}`)
  }

  if (verdict.caveats.length > 0) {
    lines.push('')
    lines.push('Caveats:')
    for (const caveat of verdict.caveats) {
      lines.push(`- ${caveat}`)
    }
  }

  return lines.join('\n')
}
