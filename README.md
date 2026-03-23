# Pullstart

Pullstart is a repo-aware onboarding product being built to get cloned projects running faster.

Phase 1 freezes the contract and proof boundary for MVP. That means the repo now has one canonical onboarding contract, one proof-repo checklist, and one narrow success claim for the first implementation cycle. Phase 2 starts building the planner against that already-defined surface.

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

The MVP contract and proof slice are intentionally narrow:

1. Read one canonical onboarding contract: `setup.spec.yaml`
2. Inspect repo and machine state for one proof repo type
3. Produce the shortest safe bootstrap plan before risky work
4. Run or guide the smallest safe setup sequence in later phases
5. Verify one declared success path and report one trustworthy blocked path
6. Keep every broader platform idea outside the MVP promise

## MVP scope

Pullstart v1 is scoped to:

- contract-driven repo onboarding
- one canonical onboarding contract: `setup.spec.yaml`
- one proof repo family: a Node.js API backed by PostgreSQL
- ordered setup planning, guided execution, verification, and blocker reporting delivered phase-by-phase
- one meaningful "repo is running" proof path plus one trustworthy blocked outcome

Pullstart v1 does not include:

- a generic agent OS
- a cross-repo memory or consensus system
- a plugin marketplace
- a team workflow platform
- a dashboard-heavy control plane
- a general autonomous coding agent replacement

## Why `setup.spec.yaml`

Pullstart needs a contract that is readable by humans and reliable for agents. `setup.spec.yaml` is the canonical onboarding surface because it keeps setup intent structured, versionable, and explicit without forcing every repo to encode onboarding logic in prose.

In Phase 1, that contract is now backed by a strict schema and one canonical proof fixture under `contracts/`. Other files like `README.md`, `AGENTS.md`, and `ONBOARDING.md` still matter, but in MVP they are supporting context, not the source of truth.

## First proof scenario

The first proof target is a single Node.js API proof repo with:

- PostgreSQL
- `.env.example`
- migrations
- one API health check

Pullstart earns its first proof only if a developer can clone that repo on a half-prepared machine, run the eventual MVP flow, and end with the app booting locally plus a passing health verification, or a precise blocker report that names the missing prerequisite.

Until that proof exists, Pullstart does not claim broad portability across arbitrary repos or stacks.

The implementation-facing boundary for that proof now lives in the proof scenario, proof checklist, and contract artifacts created in Phase 1. Those documents narrow what Phase 2 is allowed to build; they do not expand the MVP promise.

## Roadmap

The roadmap intentionally stays narrow:

- Phase 1: contract model and MVP slice
- Phase 2: minimal planner against the frozen contract and proof checklist
- Phase 3: minimal executor and verifier
- Phase 4: failure classification
- Phase 5: one real repo proof

See [PROJECT.md](/Users/bilalimamoglu/repos/pullstart/PROJECT.md), [ROADMAP.md](/Users/bilalimamoglu/repos/pullstart/ROADMAP.md), and [REQUIREMENTS.md](/Users/bilalimamoglu/repos/pullstart/REQUIREMENTS.md) for the full framing.
