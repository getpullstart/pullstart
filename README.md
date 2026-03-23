# Pullstart

Pullstart is a repo-aware onboarding agent for getting cloned projects running faster.

It reads setup contracts, checks the local environment, plans the shortest safe bootstrap path, executes or guides the critical setup steps, and verifies whether the repo is actually runnable enough to proceed.

## The wedge

Pullstart starts with one narrow promise:

**Clone a repo. Let the agent get it running.**

This is not a generic agent operating system, workflow platform, or memory layer. Version 1 is about onboarding and setup only.

## Who it is for

Pullstart is for developers joining a repo that already has some setup complexity:

- a backend service with a database and env vars
- a monorepo package with required toolchain versions
- a repo that has a mix of shell steps, docs, and tribal knowledge

The first target user is an engineer who can run commands, but should not have to reverse-engineer setup from scattered docs and failed attempts.

## How MVP works

At MVP, Pullstart focuses on six things:

1. Read one canonical onboarding contract: `setup.spec.yaml`
2. Inspect the repo and local machine state
3. Identify missing prerequisites and risky gaps
4. Produce a step-by-step bootstrap plan
5. Run or guide the smallest safe sequence of setup actions
6. Verify one declared success path and explain blockers clearly

## MVP scope

Pullstart v1 includes:

- contract-driven repo onboarding
- local environment checks
- ordered setup planning
- guided or automated bootstrap execution
- structured blocker reporting
- verification of one meaningful "repo is running" path

Pullstart v1 does not include:

- a generic agent OS
- a cross-repo memory or consensus system
- a plugin marketplace
- a team workflow platform
- a dashboard-heavy control plane
- a general autonomous coding agent replacement

## Why `setup.spec.yaml`

Pullstart needs a contract that is readable by humans and reliable for agents. `setup.spec.yaml` is the canonical onboarding surface because it keeps setup intent structured, versionable, and explicit without forcing every repo to encode onboarding logic in prose.

Other files like `README.md`, `AGENTS.md`, and `ONBOARDING.md` still matter, but in MVP they are supporting context, not the source of truth.

## First proof scenario

The first proof target is a single Node.js API repo with:

- PostgreSQL
- `.env.example`
- migrations
- one API health check

Pullstart wins if a developer can clone that repo on a half-prepared machine, run Pullstart, and end with the app booting locally plus a passing health verification, or a precise blocker report that names the missing prerequisite.

## Roadmap

The roadmap intentionally stays narrow:

- Phase 1: contract model and product framing
- Phase 2: minimal planner
- Phase 3: minimal executor and verifier
- Phase 4: failure classification
- Phase 5: one real repo proof

See [PROJECT.md](/Users/bilalimamoglu/repos/pullstart/PROJECT.md), [ROADMAP.md](/Users/bilalimamoglu/repos/pullstart/ROADMAP.md), and [REQUIREMENTS.md](/Users/bilalimamoglu/repos/pullstart/REQUIREMENTS.md) for the full framing.
