# MVP Architecture Notes

## Architecture goal

The MVP architecture exists to support one onboarding flow well, not to preview a full platform.

These notes are explanatory and secondary to the contract itself. For MVP, `setup.spec.yaml` remains the canonical onboarding contract surface.

## Layer 1: Repo contracts

The repo contract declares the bounded proof slice:

- prerequisites
- PostgreSQL as the required service for the proof repo
- env expectations anchored to `.env.example`
- setup order for install, migration, and local app start
- verification checks for the declared health path

MVP source of truth: `setup.spec.yaml`

## Layer 2: Planner

The planner combines:

- contract data from `setup.spec.yaml`
- repo inspection for `package.json`, `.env.example`, migration evidence, and the health target
- local machine inspection

For the proof repo, its output is a shortest safe bootstrap path for one Node.js API + PostgreSQL setup flow, with explicit blockers when required tools, env state, service availability, or migrations prevent progress.

## Layer 3: Executor

The Executor runs or guides the declared setup steps from the proof repo contract.

MVP executor responsibilities:

- maintain step order
- capture outcomes
- stop safely when confidence drops
- avoid destructive surprises

## Layer 4: Verifier

The Verifier checks whether the proof repo is runnable enough to continue development work.

For the proof scenario, that means confirming the Node.js API reaches its declared health path after env setup, PostgreSQL availability, and migrations. If that boundary is not met, the Verifier should report a trustworthy blocked outcome instead of broadening the diagnosis surface.

## Phase handoff boundary

Phase 2 should consume the contract and proof-repo evidence described above. Phase 3 should consume the resulting plan boundary and verify the single runnable path or single blocked path for that same proof repo.

These layers describe what later phases must consume or produce. They do not introduce new contract authority, and they do not preview plugin runtime internals or generalized orchestration behavior.

## Architectural restraint

The MVP does not need:

- a plugin runtime
- generalized orchestration substrate
- persistent cross-repo memory
- autonomous planning across unrelated workflows

Those may become relevant later, but they do not help prove the first wedge.
