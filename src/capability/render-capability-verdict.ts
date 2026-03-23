import type { CapabilityVerdict } from './capability-types.js'

function normalizeCaveat(caveat: string) {
  return caveat.trim().replace(/\.$/, '')
}

export function renderCapabilityVerdict(verdict: CapabilityVerdict) {
  const lines: string[] = []

  lines.push('Pullstart capability verdict')
  lines.push('')
  lines.push(`Decision: ${verdict.decision}`)
  lines.push(`Next step: ${verdict.nextStepId ?? 'none'}`)

  const normalizedAction = verdict.requiredUserAction?.trim()

  if (normalizedAction) {
    lines.push(`Next action: ${normalizedAction}`)
  } else if (verdict.decision !== 'can-act') {
    lines.push('Next action: Resolve the blocking check listed first and rerun verdict.')
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
      lines.push(`- Unknown: ${normalizeCaveat(caveat)}`)
    }
  }

  return lines.join('\n')
}
