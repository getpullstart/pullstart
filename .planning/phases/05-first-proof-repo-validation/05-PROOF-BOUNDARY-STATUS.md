# Phase 5 Proof Boundary Status

Evidence source: `.planning/phases/05-first-proof-repo-validation/05-PROOF-EVIDENCE.md`

Locked proof target:
- repo: `file:///tmp/pullstart-phase5-proof-repo`
- commit: `4c87ba3f944c838f26ae152823fc254804d6bc9b`

## Proven now

| Claim | Evidence |
| --- | --- |
| Pullstart can produce actionable `plan` output for the locked proof repo with no blockers in ready state. | `attempt_id=run-001-plan`, artifact `artifacts/success/plan.json` |
| Pullstart can produce `can-act` capability verdict for the same repo state and preserve unknown caveats rather than claiming certainty. | `attempt_id=run-001-verdict`, artifact `artifacts/success/verdict.json` |
| Pullstart can complete a managed run outcome with status `success` on the locked proof repo. | `attempt_id=run-001-run`, artifact `artifacts/success/run.json`, status `success` |
| Pullstart can emit a trustworthy blocked verification outcome with explicit reason and next action on the same repo commit. | `attempt_id=run-002-run`, artifact `artifacts/blocked/run.json`, status `blocked`, reason + nextAction present |

## Manual required

| Manual requirement | Evidence anchor |
| --- | --- |
| User must ensure the verification target is not already healthy from a pre-existing process before proving `start-app`. | `attempt_id=run-002-run`, `reason=verification target was already healthy before start-app; state is ambiguous`, `next_action=Stop any existing process on the verification target and rerun to prove this repository startup path.` |
| User still owns environment/service setup realism for the proof repo (e.g., declared PostgreSQL reachability) outside Pullstart's pre-execution assumptions. | `attempt_id=run-001-verdict` caveats and env/service checks in `artifacts/success/verdict.json` |

## Deferred

| Deferred item | Why deferred |
| --- | --- |
| Any portability claim beyond one Node.js API + PostgreSQL proof repo | No evidence collected beyond locked single target (D-01, D-06) |
| Multi-repo proof matrix and generalized orchestration | Explicitly out of scope for Phase 5 and unsupported by current evidence set |
| Broader non-HTTP verification types | Current runtime and proof evidence only cover HTTP verification path |

## Unresolved ambiguities

1. **Preflight-healthy verification target ambiguity remains runtime-dependent**
   - Evidence: `attempt_id=run-002-run`
   - `reason`: verification target was already healthy before start-app; state is ambiguous
   - `next_action`: stop existing process and rerun
   - Ambiguity: Pullstart cannot attribute the healthy target to this repo without clean process isolation.

2. **Registry auth/network certainty remains unknown prior to execution**
   - Evidence: `attempt_id=run-001-verdict`, `attempt_id=run-002-verdict`
   - `reason`: pre-execution caveats show auth/network checks are unknown by design
   - `next_action`: execute install step to resolve unknowns through runtime evidence
   - Ambiguity: capability verdict cannot prove package-registry auth/network until command execution.
