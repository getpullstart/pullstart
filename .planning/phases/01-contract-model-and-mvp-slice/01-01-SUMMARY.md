---
phase: 01-contract-model-and-mvp-slice
plan: "01"
subsystem: contracts
tags: [json-schema, yaml, ajv, vitest, onboarding]
requires: []
provides:
  - Strict MVP onboarding schema for setup.spec.yaml
  - Canonical proof-repo YAML fixture validated through YAML and Ajv
  - Contract boundary documentation aligned to the executable surface
affects: [phase-02-planner, contract-validation, onboarding-docs]
tech-stack:
  added: [ajv, ajv-formats, vitest, yaml]
  patterns: [strict-json-schema, canonical-yaml-fixture, contract-first-doc-alignment]
key-files:
  created:
    - contracts/setup.spec.schema.json
    - package.json
    - test/contracts/setup-spec-fixtures.test.ts
    - .planning/phases/01-contract-model-and-mvp-slice/01-01-SUMMARY.md
  modified:
    - contracts/setup.spec.example.yaml
    - docs/onboarding-contract.md
key-decisions:
  - "Phase 1 freezes the contract to version 0 with only repo, tools, services, env, steps, and verify."
  - "The canonical fixture is validated through YAML parsing plus Ajv strict mode instead of prose review alone."
patterns-established:
  - "Contract-first MVP: setup.spec.yaml is authoritative and supporting docs remain explanatory."
  - "Every object shape in the schema rejects extra fields to keep future parser work deterministic."
requirements-completed: [CNTR-01, CNTR-02, CNTR-03]
duration: 10min
completed: 2026-03-23
---

# Phase 1 Plan 01: Contract Model And MVP Slice Summary

**Version 0 onboarding contract schema, canonical proof fixture, and aligned MVP boundary documentation for setup.spec.yaml**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-23T03:10:00Z
- **Completed:** 2026-03-23T03:20:12Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Froze `setup.spec.yaml` into a strict Draft 2020-12 schema with a minimal top-level surface.
- Rewrote the proof fixture and validated it through the intended YAML plus Ajv path with Vitest.
- Updated the contract guide so docs, schema, and example all describe the same narrow MVP boundary.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create the strict MVP contract schema** - `2b2fd05` (feat)
2. **Task 2: Rewrite the example contract and prove schema conformance** - `5145a58` (feat)
3. **Task 3: Document contract rules and source-of-truth boundaries** - `049552f` (docs)

## Files Created/Modified

- `contracts/setup.spec.schema.json` - Defines the strict Phase 1 MVP onboarding contract.
- `contracts/setup.spec.example.yaml` - Canonical Node.js plus PostgreSQL proof fixture.
- `package.json` - Minimal validation bootstrap for contract tests.
- `test/contracts/setup-spec-fixtures.test.ts` - Parses YAML and validates the fixture with Ajv.
- `docs/onboarding-contract.md` - Documents canonical contract rules and excluded Phase 1 scope.

## Decisions Made

- Kept the schema narrowly scoped to `version`, `repo`, `tools`, `services`, `env`, `steps`, and `verify` so Phase 2 can parse one stable shape.
- Modeled service alternatives structurally with `strategy` plus `options` instead of burying required behavior in fallback prose.
- Used strict YAML parsing and Ajv strict mode so ambiguous contract shapes fail early.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Ajv strict conditional requirements in the service option schema**
- **Found during:** Task 2 (Rewrite the example contract and prove schema conformance)
- **Issue:** Ajv strict mode rejected conditional `required` clauses for `command` and `note` because the `then` branches did not define those properties.
- **Fix:** Added explicit property definitions inside each conditional branch for `docker-compose` and `existing` service options.
- **Files modified:** `contracts/setup.spec.schema.json`
- **Verification:** `pnpm vitest run test/contracts/setup-spec-fixtures.test.ts -t CNTR-02`
- **Committed in:** `5145a58` (part of Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** The fix was required for the intended strict validator path and did not broaden scope.

## Issues Encountered

- No repo package bootstrap existed, so Task 2 added the smallest `package.json` needed to run contract validation without expanding into runtime implementation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 2 can now parse against one frozen contract shape instead of inferring setup intent from prose.
- The contract example and documentation are aligned, so future planner work has a single authoritative fixture.

## Self-Check: PASSED

- Found `contracts/setup.spec.schema.json`
- Found `contracts/setup.spec.example.yaml`
- Found `package.json`
- Found `test/contracts/setup-spec-fixtures.test.ts`
- Found `docs/onboarding-contract.md`
- Found commit `2b2fd05`
- Found commit `5145a58`
- Found commit `049552f`

---
*Phase: 01-contract-model-and-mvp-slice*
*Completed: 2026-03-23*
