# Phase 1 Research: Contract Model And MVP Slice

**Date:** 2026-03-23
**Phase:** 1
**Requirements:** CNTR-01, CNTR-02, CNTR-03

## Research Question

What needs to be true for Pullstart to plan Phase 1 well without broadening scope beyond the onboarding MVP?

## Key Findings

### 1. The MVP contract should stay intentionally small

The existing product framing already supports a good first contract shape. For the first proof repo, `setup.spec.yaml` only needs to express:

- repo identity and intent
- tool prerequisites
- required environment files
- required services and health checks
- ordered setup steps
- one verification path
- minimal fallback notes

The contract should not try to model every possible repo pattern yet. If Phase 1 adds abstraction for optional orchestration models, multi-environment policies, reusable macros, or plugin-like extension points, it will weaken the wedge.

### 2. The proof repo fixture should be concrete enough to drive implementation

The first proof scenario is strongest when it is treated like a test fixture, not just a narrative example.

The fixture should define:

- exact repo signals Pullstart expects to read
- exact machine prerequisites it needs to check
- exact sequence of setup actions
- exact verification target
- exact blocked outcomes that still count as a useful result

That means the proof contract should be specific about:

- runtime and package manager
- env-file derivation from `.env.example`
- how PostgreSQL is expected to become reachable
- migration command
- app start command
- verification endpoint or equivalent command

### 3. The best Phase 1 output is a stable contract boundary for Phase 2

Phase 1 should feed Phase 2 with a contract and fixture that are specific enough for planner implementation. It does not need to prove planner logic, only remove ambiguity around the planner's expected inputs.

The handoff to Phase 2 should answer:

- what schema fields are officially in-bounds
- what repo signals Phase 2 can rely on
- what verification state counts as "runnable enough"
- which missing pieces become planner-detected blockers versus execution-time failures

### 4. Documentation alignment matters because root docs already set expectations

The root docs are already strong. Phase 1 should preserve their clarity while tightening any places where wording is still slightly conceptual.

The highest-value doc alignment work is:

- keep the root docs and `.planning` docs consistent about `setup.spec.yaml`
- make the example contract feel like a true MVP contract, not a placeholder sketch
- define the proof repo fixture and verification contract in terms precise enough for implementation

### 5. The smallest useful blocker boundary should be explicit now

Even before Phase 4 formalizes blocker taxonomy, Phase 1 should define the boundary between:

- declared prerequisites missing before setup begins
- repo setup steps that fail during execution
- verification failures after setup completes

This keeps the contract and proof fixture honest and helps Phase 2 avoid mixing planning and execution responsibilities.

## Recommendations

### Recommended MVP schema shape

Use a flat, readable structure with only the fields the proof repo needs:

- `version`
- `repo`
- `prerequisites`
- `environment`
- `services`
- `steps`
- `verify`
- `fallback_notes`

Recommendation:

- move env-file expectations out of `prerequisites.files` into an explicit `environment` section
- keep service health checks simple
- keep step shape minimal: `id`, `run`, `required`, optional `uses`
- keep verify shape minimal: one HTTP or command check for MVP

### Recommended proof fixture contract

Treat the first proof fixture as a Node.js API contract with:

- Node 20.x
- pnpm 9.x
- `.env` derived from `.env.example`
- PostgreSQL service reachable on a known local port or via Docker Compose
- dependency install
- migration step
- app start step
- health-check verification on a known URL

### Recommended Phase 1 artifacts

Phase 1 should likely produce:

- a tightened `contracts/setup.spec.example.yaml`
- a contract-principles doc that distinguishes required MVP fields from future ideas
- a proof-fixture doc that describes exact success and blocked outcomes
- alignment updates in root and `.planning` docs where wording still drifts

## Risks To Avoid

- expanding the schema to cover too many repo types before the first proof repo
- writing architecture language that sounds more implemented than it is
- leaving verification underspecified enough that "working" becomes subjective
- using fallback notes as a dumping ground for logic that should be modeled explicitly

## Planning Implications

The Phase 1 plan should split into three executable tracks:

1. Contract schema and contract rules
2. Proof fixture and verification contract
3. Documentation alignment for a single narrow MVP slice

Those tracks map cleanly to the roadmap's three planned Phase 1 plans.
