# Phase 5 Proof Evidence Ledger

## Execution note

- Locked repo URL: `file:///tmp/pullstart-phase5-proof-repo`
- Locked repo commit: `4c87ba3f944c838f26ae152823fc254804d6bc9b`
- Command sequence per attempt: `plan` → `verdict` → `run`
- CLI execution path: **CLI `main` invocation with dependency injection** (test-faithful path), because direct `node src/cli/*.ts` is not executable in this repository due to local `.js` import expectations.

## Attempt ledger

| attempt_id | repo_commit | state_seed | command | artifact | status | blocker_category | reason | next_action | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| run-001-plan | 4c87ba3f944c838f26ae152823fc254804d6bc9b | service reachable, normal verify target | plan --summary | artifacts/success/plan.json | complete | n/a | n/a | n/a | selected `local-instance` service branch |
| run-001-verdict | 4c87ba3f944c838f26ae152823fc254804d6bc9b | same as above | verdict --summary | artifacts/success/verdict.json | complete | n/a | n/a | n/a | `decision=can-act`, caveats captured as unknown pre-execution auth/network |
| run-001-run | 4c87ba3f944c838f26ae152823fc254804d6bc9b | same as above | run --summary | artifacts/success/run.json | success | n/a | verification target responded with expected status while app was managed | n/a | executed `install,migrate`, guided `start-app`, verification success |
| run-002-plan | 4c87ba3f944c838f26ae152823fc254804d6bc9b | pre-healthy verification target seeded | plan --summary | artifacts/blocked/plan.json | complete | n/a | n/a | n/a | same plan as run-001 (same repo commit) |
| run-002-verdict | 4c87ba3f944c838f26ae152823fc254804d6bc9b | same as above | verdict --summary | artifacts/blocked/verdict.json | complete | n/a | n/a | n/a | same verdict as run-001 (same repo commit) |
| run-002-run | 4c87ba3f944c838f26ae152823fc254804d6bc9b | pre-healthy verification target seeded | run --summary | artifacts/blocked/run.json | blocked | verification | verification target was already healthy before start-app; state is ambiguous | Stop any existing process on the verification target and rerun to prove this repository startup path. | blocked outcome is explicit and trustworthy; includes one actionable next step |

## Evidence highlights (PROOF-01)

1. **Success path proven**
   - `artifacts/success/run.json` has `"status": "success"`.
   - Outcome reason confirms managed start-app verification boundary was met.

2. **Blocked path proven**
   - `artifacts/blocked/run.json` has `"status": "blocked"`.
   - Blocked record includes explicit `reason` and `nextAction`.
   - Summary classification resolves blocker category as `verification`.

3. **Single-repo traceability maintained**
   - Both attempts are tied to the **same** repo URL and commit SHA.
   - No second repo or portability evidence is introduced.

## What changed between attempts

- `run-001` used a clean verification target state.
- `run-002` intentionally seeded an already-healthy verification target before `start-app`.
- No contract, repo content, or code changes were made between attempts.
