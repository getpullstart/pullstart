# Phase 5 Proof Run Protocol

## Scope lock (D-01, D-06)

- **Locked proof repo URL:** `file:///tmp/pullstart-phase5-proof-repo`
- **Locked proof repo commit:** `4c87ba3f944c838f26ae152823fc254804d6bc9b`
- **Allowed repo count:** exactly **one** (no additional repo targets allowed for Phase 5 evidence)

This protocol is intentionally narrow: one Node.js API + PostgreSQL proof slice only. No portability expansion claims are permitted from these runs.

## Contract and runtime flow lock (D-02)

- Contract surface: `setup.spec.yaml` in the locked proof repo
- Execution flow: existing Pullstart Phase 2-4 behavior only
- Fixed command order per attempt:
  1. `plan`
  2. `verdict`
  3. `run`

## CLI execution method (evidence-faithful)

Direct `node src/cli/*.ts` execution is not viable in this repo because CLI files import local `.js` paths that are resolved through the test/runtime transform layer.

Per repository-established test practice, Phase 5 proof runs use **CLI `main` invocation with dependency injection** (same approach used in `test/cli/*.test.ts` and `test/cli/runtime-guidance.integration.test.ts`) to execute real planner/verdict/bootstrap logic and capture artifacts.

## Required attempt classes

| Attempt class | Seeded state | Expected run status | Purpose |
| --- | --- | --- | --- |
| `success` | service reachable, clean verification target (not pre-healthy) | `success` | prove runnable managed path |
| `blocked` | same repo/commit, but verification target pre-healthy before `start-app` | `blocked` | capture trustworthy blocked outcome with reason + nextAction |

## Output artifacts

Generated under:

- `.planning/phases/05-first-proof-repo-validation/artifacts/success/`
- `.planning/phases/05-first-proof-repo-validation/artifacts/blocked/`

Each class must include:

- `plan.json`
- `verdict.json`
- `run.json`
- `plan.summary.txt`
- `verdict.summary.txt`
- `run.summary.txt`

Environment baseline is captured in:

- `.planning/phases/05-first-proof-repo-validation/artifacts/env-audit.txt`
