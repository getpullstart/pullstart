import type { BootstrapPlan } from './plan-types.js'
import { classifyPlannerBlocker } from '../blockers/classify-blocker.js'

export function renderPlan(plan: BootstrapPlan) {
  const lines: string[] = []

  lines.push('Pullstart planner summary')
  lines.push('')

  if (plan.blockers.length > 0) {
    lines.push('Blockers:')
    for (const blocker of plan.blockers) {
      const classified = classifyPlannerBlocker(blocker)
      lines.push(
        `- ${blocker.id} [${classified.category}]: ${blocker.message} Next action: ${classified.nextAction}`
      )
      if (blocker.contradictionRefs && blocker.contradictionRefs.length > 0) {
        lines.push(`  Contradictions: ${blocker.contradictionRefs.join(', ')}`)
      }
      if (blocker.factRefs && blocker.factRefs.length > 0) {
        lines.push(`  Evidence refs: ${blocker.factRefs.map((fact) => fact.id).join(', ')}`)
      }
    }
    lines.push('')
  }

  if (plan.selectedServiceOptions.length > 0) {
    lines.push('Selected service path:')
    for (const option of plan.selectedServiceOptions) {
      lines.push(`- ${option.serviceName}: ${option.optionId} (${option.reason})`)
    }
    lines.push('')
  }

  lines.push('Ordered steps:')
  for (const step of plan.steps) {
    const dependencies = step.dependsOn.length > 0 ? ` depends on ${step.dependsOn.join(', ')}` : ''
    const reason = step.reason ? ` — ${step.reason}` : ''
    lines.push(`- [${step.status}] ${step.id}: ${step.name}${dependencies}${reason}`)
  }

  if (plan.contradictions && plan.contradictions.length > 0) {
    lines.push('')
    lines.push('Contradictions:')
    for (const contradiction of plan.contradictions) {
      lines.push(
        `- ${contradiction.id}: ${contradiction.summary} (declared=${contradiction.declaredFactId}, observed=${contradiction.observedFactId})`
      )
    }
  }

  return lines.join('\n')
}
