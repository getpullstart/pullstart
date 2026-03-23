# MVP Proof Scenario

## Scenario

Pullstart proves the MVP on one bounded repo type: a `Node.js API` service backed by `PostgreSQL`.

This proof slice assumes the repo already declares its onboarding path through `setup.spec.yaml` and contains the concrete repo evidence that later phases will inspect. The point of the proof is not portability. The point is to show that one trustworthy onboarding contract can carry one credible local setup path to a runnable outcome, or to a trustworthy blocked outcome.

## Proof repo boundary

The first proof repo must include all of the following:

- `package.json` with the app scripts needed for install, migration, and local start
- `.env.example` as the reviewable source for required local environment variables
- a migration command or migration script entry that prepares PostgreSQL for local use
- a local app start command for the API service
- a `health` endpoint or equivalent declared verification target that proves the API is runnable enough to continue

The proof repo may include helper files such as Docker Compose or README notes, but those remain supporting evidence. The MVP contract surface is still `setup.spec.yaml`.

## Concrete starting states

Future planner and verifier work should assume a developer has cloned the repo and may be in one of these starting states:

1. Ready to install: required tools are present, but dependencies are not installed and no local setup steps have run yet.
2. Missing tool: the machine does not have a declared required tool such as the expected Node.js runtime, package manager, or PostgreSQL access path.
3. Missing env: `.env.example` exists, but the working env file has not been created or is still missing values required to boot the API.
4. Missing service: the repo is present and env is prepared, but PostgreSQL is not reachable through the declared local path.
5. Missing migration: dependencies may be installed and PostgreSQL may be reachable, but the database schema has not been created through the declared migration step.

These states are intentionally concrete because the first implementation only needs to reason about this proof repo. It should not invent broader repo families or alternate runtime models.

## Repo evidence later phases should rely on

For this proof slice, later implementation work should expect to inspect:

- `setup.spec.yaml` for the declared onboarding contract
- `package.json` for install, migration, and start command evidence
- `.env.example` for expected local environment keys
- repository-local service hints that support PostgreSQL startup or reachability
- the declared `health` verification path that confirms the Node.js API is actually up

## What counts as a win

The MVP win condition is one trustworthy runnable path:

- Pullstart can determine the declared prerequisites and repo evidence for this Node.js API setup path.
- Pullstart can reach a state where dependencies are installed, env expectations are satisfied, PostgreSQL is available, migrations have run, and the API passes the declared `health` verification.
- The final output makes it clear that the repo is runnable enough for a developer to continue local work.

## What counts as a blocked condition

The MVP also succeeds if it reaches one trustworthy blocked outcome instead of guessing:

- a required tool is missing
- the env file or required env values are missing
- PostgreSQL is not reachable through the declared local path
- the migration step cannot complete
- the API cannot satisfy the declared `health` verification after the required setup steps

The blocked condition must identify which prerequisite or setup stage stopped progress. It should not claim success, and it should not widen the scope into generic repo diagnostics.

## Phase 5 evidence snapshot

### Proven now

- One locked proof repo target was executed with the existing `plan` → `verdict` → `run` flow.
- A success-path run was captured where managed verification reached the declared health target.
- A blocked-path run was captured on the same repo/commit where the health target was already healthy before `start-app`, yielding a trustworthy ambiguity block and clear rerun action.

### Manual required

- Operators must ensure no pre-existing app process is occupying the verification target before proof reruns.
- Tool/auth/network certainty can still require human confirmation at execution time.
- Local service ownership (existing instance vs compose-managed) remains environment-dependent.

### Deferred

- Broader compatibility claims across multiple repo families.
- Fully automatic environment healing for every blocked class.
- Advanced run-state reuse/resume semantics beyond current bounded execution model.

### Unresolved ambiguities

- If the health endpoint is already responding before `start-app`, Pullstart cannot prove that this repo startup caused the healthy state; it must block and request process cleanup + rerun.
- Auth/network certainty for package installation remains unknown in pre-execution verdicts and only resolves during runtime attempts.
