---
phase: 02-deterministic-evidence-core-hardening
plan: "03"
subsystem: api
tags: [execution, cli, provenance, runtime-evidence, unknown-lifecycle]

# Dependency graph
requires:
  - phase: 02-02
    provides: planner/verdict structured fact refs, contradictions, and unknown lifecycle fields
provides:
  - Runtime execution outcomes now include runtime-observed fact records and preserve upstream provenance context.
  - Execution event details carry additive continuity references (facts, contradictions, unknown evidence, runtime evidence refs).
  - Plan/verdict/run CLI JSON outputs are validated to expose hardened structured evidence fields.
affects: [execute-runtime, cli-json-contract, verification-output]

# Tech tracking
tech-stack:
  added: []
  patterns: [runtime-observed-evidence-threading, additive-json-compatibility, unknown-state-continuity]

key-files:
  created:
    - .planning/phases/02-deterministic-evidence-core-hardening/02-03-SUMMARY.md
  modified:
    - src/execute/execution-types.ts
    - src/execute/run-bootstrap.ts
    - src/execute/run-managed-start-app.ts
    - test/execute/run-bootstrap.test.ts
    - test/execute/run-managed-start-app.test.ts
    - test/execute/run-managed-start-app.runtime.test.ts
    - test/cli/run-outcome.test.ts
    - test/cli/plan.test.ts
    - test/cli/verdict.test.ts
    - test/cli/run.test.ts

key-decisions:
  - "Run outcomes remain additive: legacy caveats/events semantics are preserved while new factRefs/contradictions/unknownEvidence/runtimeEvidence are appended."
  - "Execution events include compact continuity references in details rather than renderer-specific narrative expansion."
  - "Managed verification emits runtime-observed facts for preflight ambiguity, success, and blocked outcomes to preserve deterministic runtime provenance."

patterns-established:
  - "Pattern 1: runtime evidence is captured as FactRecord[source=runtime-observed] and surfaced both in outcome.runtimeEvidence and event detail refs."
  - "Pattern 2: CLI JSON contract stays default JSON.stringify payload while tests enforce hardened structured fields."

requirements-completed: [EVD-02, UNKN-03]

# Metrics
duration: 5 min
completed: 2026-03-23
---

# Phase 02 Plan 03: Complete runtime evidence continuity through execution and CLI outputs

**Execution and CLI surfaces now carry deterministic runtime-observed evidence plus upstream provenance/unknown continuity without collapsing blocked-vs-unknown semantics.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-23T17:48:13Z
- **Completed:** 2026-03-23T17:53:06Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Extended execution output models to include additive `factRefs`, `contradictions`, `unknownEvidence`, and `runtimeEvidence`.
- Threaded runtime-observed facts through finite step outcomes and managed start-app verification (preflight ambiguity, success, and blocked outcomes).
- Added continuity references on execution event details (`runtimeEvidenceRefs`, `factRefs`, `contradictionRefs`, `unknownEvidenceRefs`) for machine-readability.
- Updated CLI-facing tests to assert hardened structured evidence fields across plan, verdict, run, and run outcome surfaces.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add runtime-observed provenance payloads to execution events and outcomes** - `20f9739` (feat)
2. **Task 2: Expose hardened evidence model through CLI JSON outputs and compatibility tests** - `7573229` (test)

## Files Created/Modified

- `src/execute/execution-types.ts` - Added additive runtime/provenance fields on run and managed start-app result types.
- `src/execute/run-bootstrap.ts` - Preserved verdict provenance into outcomes and emitted runtime-observed evidence with per-event continuity refs.
- `src/execute/run-managed-start-app.ts` - Produced runtime-observed verification facts for ambiguous preflight, success, and blocked verification paths.
- `test/execute/run-bootstrap.test.ts` - Added assertions for runtime evidence payloads and continuity linkage fields.
- `test/execute/run-managed-start-app.test.ts` - Added unit assertions for runtime-observed evidence in managed outcomes.
- `test/execute/run-managed-start-app.runtime.test.ts` - Added runtime behavior checks for emitted runtime-observed evidence.
- `test/cli/run-outcome.test.ts` - Asserted run outcome continuity fields remain visible with blocked/unknown semantics.
- `test/cli/plan.test.ts` - Asserted CLI plan JSON surfaces structured fact/contradiction fields.
- `test/cli/verdict.test.ts` - Asserted CLI verdict JSON surfaces structured provenance and unknown evidence fields.
- `test/cli/run.test.ts` - Asserted CLI run JSON includes runtime evidence continuity fields.

## Decisions Made

- Kept all new fields additive to existing run/plan/verdict payload shapes to remain backward-compatible.
- Preserved explicit blocked and unknown semantics by carrying unknown lifecycle structures and not remapping unknown into blocked.
- Kept renderer behavior concise by threading structured refs in events instead of adding narrative-heavy output modes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Plan verify command includes unsupported Vitest flag `-x`**
- **Found during:** Task 1 and Task 2 verification
- **Issue:** `pnpm test -- ... -x` fails with `CACError: Unknown option -x` on current Vitest version.
- **Fix:** Executed equivalent targeted test commands without `-x`.
- **Files modified:** None (execution command adjustment only)
- **Verification:** All targeted suites and full `pnpm test` passed.
- **Committed in:** N/A (process-level deviation)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** No scope expansion; only adjusted test invocation syntax to match repository toolchain.

## Issues Encountered

- Vitest CLI rejected `-x`; handled by running the same file-targeted commands without that flag.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- End-to-end evidence continuity now extends from planner/verdict context into execution runtime and CLI JSON surfaces.
- Runtime and CLI regression tests enforce additive compatibility and explicit unknown/blocked semantics for future phases.

## Self-Check: PASSED

- SUMMARY file exists at `.planning/phases/02-deterministic-evidence-core-hardening/02-03-SUMMARY.md`.
- Task commits `20f9739` and `7573229` exist in git history.

---
*Phase: 02-deterministic-evidence-core-hardening*
*Completed: 2026-03-23*
