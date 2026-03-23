# Pullstart Requirements

## MVP requirement framing

These requirements describe the smallest credible version of Pullstart.

They are intentionally scoped to one onboarding contract surface, one proof repo type, and one meaningful setup success path.

## Core requirements

### R1. Canonical contract support

Pullstart must parse a canonical onboarding contract named `setup.spec.yaml`.

The contract must be able to declare, at minimum:

- required tools and versions
- required services
- environment file expectations
- ordered bootstrap steps
- verification commands or checks
- fallback notes for special cases

### R2. Repo-aware inspection

Pullstart must inspect repo evidence relevant to the proof scenario, including runtime metadata, package manager signals, env templates, service configuration hints, and declared verification paths.

### R3. Machine-state inspection

Pullstart must inspect the local machine for prerequisites declared by the contract, including missing tools, incompatible versions, unavailable services, and missing env setup.

### R4. Ordered setup planning

Pullstart must produce a stepwise bootstrap plan that:

- respects dependency order
- identifies required versus optional steps
- names blockers before destructive work
- keeps the shortest safe path visible to the user

### R5. Guided or automatic execution

Pullstart must support running or guiding the critical setup sequence declared by the contract.

MVP execution must prioritize safety and clarity over aggressive automation.

### R6. Verification

Pullstart must verify one declared success path for the proof repo.

Verification must report:

- what passed
- what failed
- what remained blocked
- what still requires manual action

### R7. Structured blocker reporting

When setup cannot complete, Pullstart must classify the blocker into a small actionable category and explain the next useful step.

### R8. Scope honesty

Pullstart documentation and behavior must not imply support for arbitrary repos, generalized agent orchestration, or broad platform features that the MVP does not actually deliver.

## Constraints

- MVP is optimized for one real proof repo type before broader portability
- `setup.spec.yaml` is the only canonical onboarding contract surface in MVP
- repo docs may supplement the contract but must not replace it as source of truth
- heuristics may assist inspection but must not silently override declared contract intent
- execution should avoid destructive surprises and make key actions understandable

## Contract expectations

The onboarding contract should remain:

- small enough to review comfortably
- explicit enough for agents to trust
- readable enough for humans to maintain
- versionable alongside the repo it describes

The initial contract schema should stay minimal and obvious. It should not become a giant framework before the proof scenario is validated.

## Verification expectations

For MVP, a verification path is sufficient when it proves the repo is runnable enough to continue real development work.

For the first proof repo, that likely means:

- dependencies installed
- env configured
- required service reachable
- migrations applied
- app booting successfully
- health check or equivalent verification passing

## Safety expectations

Pullstart must:

- explain planned setup actions before or while taking them
- distinguish prerequisites from repo-specific failures
- avoid pretending a setup succeeded when verification is missing
- stop with a clear blocker state when the safe path is no longer obvious

## Deferred requirements

These are explicitly out of MVP scope:

- self-learning memory systems
- cross-repo shared knowledge graphs
- plugin ecosystems
- dashboards and admin surfaces
- generalized multi-agent workflow execution
- runtime substrate abstraction layers
- universal support claims across arbitrary stacks
