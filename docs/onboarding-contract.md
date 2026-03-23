# Onboarding Contract

## Canonical surface

`setup.spec.yaml` is the only canonical onboarding contract surface in Pullstart MVP.

The validation contract for that file lives in `contracts/setup.spec.schema.json`, which defines the strict JSON Schema shape Phase 2 is allowed to parse.

## Supported MVP sections

Phase 1 supports one deliberately small section set:

- `version`
- `repo`
- `tools`
- `services`
- `env`
- `steps`
- `verify`

These sections are enough to describe the first proof scenario: a Node.js API repo with PostgreSQL, `.env.example`, ordered bootstrap steps, and one health verification path.

## Why the contract stays narrow

The MVP contract is meant to be reviewable by humans and reliable for strict parsing. That means the spec declares setup intent in a small declarative shape instead of spreading required behavior across prose or hidden fallback notes.

If a detail is required to get the repo running, it belongs in one of the supported sections above. Supporting docs can explain context, but they do not redefine the contract.

## What supporting docs still do

Files like `README.md`, `ONBOARDING.md`, and `AGENTS.md` still matter. They give background, troubleshooting context, and product framing that help developers understand the repo.

In MVP they are secondary sources, not ignored sources. Pullstart can use them as explanation, but `setup.spec.yaml` remains the authoritative declaration of onboarding intent.

## Explicit Phase 1 exclusions

Phase 1 does not broaden the contract into a workflow language or portability promise. The current boundary intentionally excludes:

- planner logic or branching rules
- executor mechanics and runtime control flow
- blocker taxonomy or recovery systems
- broad portability claims beyond the first Node.js plus PostgreSQL proof slice

Keeping these out of the contract makes the next implementation phases smaller and easier to verify.

## Phase 5 proof-boundary status

### Proven now

- The contract shape is sufficient for one real Node.js API + PostgreSQL proof target.
- The same contract-driven flow can reach:
  - `success` when managed `start-app` verification reaches the declared health target.
  - `blocked` when verification is already healthy before `start-app`, with explicit ambiguity guidance.
- Runtime outcomes remain contract-bounded: no hidden fallback heuristics outside declared sections.

### Manual required

- Users still own machine prerequisites and service state that cannot be guaranteed pre-execution.
- When the verification target is already healthy before startup, user intervention is required to clear existing processes and rerun.
- Environment completeness (`.env` values) remains a real-world prerequisite outside contract parsing itself.

### Deferred

- Adding cross-repo abstraction layers or contract auto-generation.
- Extending the contract into a generic workflow DSL.
- Persisted user preference memory and advanced CLI orchestration semantics beyond MVP proof scope.

### Unresolved ambiguities

- Verification ownership ambiguity remains when the health target is already healthy before managed `start-app`; Pullstart blocks and asks for a clean rerun instead of attributing success.
- Registry auth/network readiness remains unknown before execution and is surfaced as caveats by design.
