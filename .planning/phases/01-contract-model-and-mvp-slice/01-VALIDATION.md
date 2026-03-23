# Phase 1 Validation Plan

**Phase:** 1 - Contract Model And MVP Slice  
**Date:** 2026-03-23  
**Status:** Ready for execution

## Goal

Define the minimum validation architecture needed to prove CNTR-01 through CNTR-03 once Phase 1 plans execute.

## Wave 0 Bootstrap

Before Phase 1 validation can run, the repo needs a minimal contract-validation harness:

- create `package.json` for the repo if it does not already exist
- add dev dependencies: `vitest`, `yaml`, `ajv`, `ajv-formats`
- add `test/contracts/` as the contract validation test surface
- ensure the schema file and canonical example contract exist

This bootstrap is intentionally narrow. It exists only to validate the MVP contract surface and proof fixture, not to start broader runtime implementation.

## Requirement To Test Map

| Req ID | Behavior | Test Type | Automated Command | Planned Artifact |
|--------|----------|-----------|-------------------|------------------|
| CNTR-01 | Only `setup.spec.yaml` is treated as canonical MVP contract input | unit | `pnpm vitest run test/contracts/setup-spec-schema.test.ts -t CNTR-01` | `test/contracts/setup-spec-schema.test.ts` |
| CNTR-02 | Schema accepts tools, services, env, ordered steps, and verification checks for the proof repo | unit | `pnpm vitest run test/contracts/setup-spec-fixtures.test.ts -t CNTR-02` | `test/contracts/setup-spec-fixtures.test.ts` |
| CNTR-03 | Invalid or ambiguous contract shapes are rejected while valid fixtures stay reviewable | unit | `pnpm vitest run test/contracts/setup-spec-negative.test.ts -t CNTR-03` | `test/contracts/setup-spec-negative.test.ts` |

## Validation Gates

### Per Task

- run the focused test for any contract artifact changed by the task

### Per Wave

- `pnpm vitest run test/contracts/*.test.ts`

### Phase Gate

- schema tests, fixture tests, and negative tests pass together
- the example fixture validates against the schema through the intended YAML + Ajv path
- docs still describe the same supported section set and proof boundary

## Planned Coverage By Phase 1 Plans

- `01-01-PLAN.md`: schema, example contract, and fixture validation path
- `01-02-PLAN.md`: proof repo checklist and success-boundary documentation
- `01-03-PLAN.md`: cross-doc alignment after contract and proof artifacts are finalized

## Open Notes

- `CNTR-01` and `CNTR-03` test files are part of the Wave 0 validation surface even if their creation is deferred to the most practical Phase 1 task sequencing.
- If validation bootstrap threatens to broaden Phase 1 beyond contract work, prefer the smallest possible harness that still proves schema/example correctness.
