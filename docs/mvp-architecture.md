# MVP Architecture Notes

## Architecture goal

The MVP architecture exists to support one onboarding flow well, not to preview a full platform.

## Layer 1: Repo contracts

The repo contract declares:

- prerequisites
- services
- env expectations
- setup order
- verification checks

MVP source of truth: `setup.spec.yaml`

## Layer 2: Planner

The planner combines:

- contract data
- repo inspection
- local machine inspection

Its output is a shortest safe bootstrap path with explicit blockers and dependencies.

## Layer 3: Executor

The executor runs or guides the declared setup steps.

MVP executor responsibilities:

- maintain step order
- capture outcomes
- stop safely when confidence drops
- avoid destructive surprises

## Layer 4: Verifier

The verifier checks whether the repo is runnable enough to continue development work.

For the proof scenario, that means verifying the app boots and passes a declared health path after env, service, and migration setup.

## Architectural restraint

The MVP does not need:

- a plugin runtime
- generalized orchestration substrate
- persistent cross-repo memory
- autonomous planning across unrelated workflows

Those may become relevant later, but they do not help prove the first wedge.
