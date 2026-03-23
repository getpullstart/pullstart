# Proof repo checklist

This checklist is the narrow handoff artifact for the first Pullstart proof repo.

It exists to support D-03 and D-05:

- D-03 fixes the first proof target as one Node.js API service with PostgreSQL, `.env.example`, migrations, and a health check.
- D-05 limits Phase 1 to contract and proof-boundary definition, not planner or executor implementation.

The checklist should help later phases inspect one concrete repo honestly. It should not expand Pullstart into a portability layer.

## Required proof repo evidence

The proof repo must contain all of the following:

- `setup.spec.yaml` as the declared onboarding contract for the repo
- `package.json` with scripts or command evidence for dependency install, migration, and local app start
- `.env.example` with the local environment variables a developer is expected to provide
- PostgreSQL as the declared backing service for local development
- a migration command or migration script entry that prepares the database schema
- a health check target that proves the API is runnable enough after setup

## Contract content that must be declared

For this proof slice, `setup.spec.yaml` must declare enough information for later implementation to reason about:

- required local tools for the Node.js API setup path
- PostgreSQL as the required service dependency
- env expectations anchored to `.env.example`
- ordered setup steps for install, migration, and local app start
- the single success verification boundary: a health check for the running API

## What must exist in the proof repo

These are repo responsibilities, not Pullstart inference responsibilities:

- a real `package.json`
- a real `.env.example`
- a real path to PostgreSQL access for local development
- a real migration step
- a real health check path or equivalent declared verification command

If any of those are absent, the proof repo is incomplete for MVP and later phases should treat that as missing repo evidence, not as a reason to broaden the product surface.

## What Pullstart may infer later

Later implementation may inspect the repo to confirm or locate:

- package manager and runtime details implied by `package.json`
- whether the env file has been created from `.env.example`
- whether PostgreSQL is reachable through the declared local path
- whether the migration step has been run
- whether the health check succeeds after startup

Those checks consume the proof repo contract. They do not replace it.

## Allowed service assumptions

For the first proof repo, Pullstart may assume only the narrow service boundary already captured by D-03:

- one Node.js API service
- one PostgreSQL dependency for local use
- one declared health check boundary

Supporting local service hints such as Docker Compose are allowed if the repo already contains them, but they remain secondary evidence. They are not a license to add generalized service orchestration in Phase 1.

## Single success verification boundary

The only success boundary for the first proof repo is:

- the Node.js API can boot through the declared setup path
- PostgreSQL is available enough for the declared migration step to complete
- the declared health check passes

That boundary is intentionally narrow. It proves runnable local onboarding for one repo type. It does not prove broad compatibility, broader workflow automation, or arbitrary service management.

## Explicit deferrals

The following are intentionally deferred beyond this checklist:

- portability extras for repo families beyond the first proof repo
- generalized runtime or plugin abstractions
- executor internals, verifier internals, or blocker taxonomy mechanics
- broader repo diagnostics that are not needed to explain the first success or blocked path

## Phase 5 proof status

### Proven now

- Checklist assumptions were validated against one locked proof target and commit.
- Evidence captured both:
  - success (`run.status = success`)
  - blocked (`run.status = blocked`) with explicit `reason` and `nextAction`
- The blocked ambiguity case (pre-healthy verification target) is now a first-class, documented runtime boundary.

### Manual required

- Users must still provide/maintain valid `.env` values in real runs.
- Users must ensure service/process state is clean for trustworthy startup verification.
- Real auth/network conditions remain caveated before execution.

### Deferred

- Promotion of checklist guarantees to multi-repo portability.
- Any claim that Pullstart can infer full repo setup without contract declaration.

### Unresolved ambiguities

- A pre-healthy verification target (`health` already responding before `start-app`) is treated as ambiguous ownership and must be manually cleared before rerun.
- Pre-execution auth/network checks remain caveated unknowns until install/runtime commands are attempted.
