# Pullstart Requirements

## MVP requirement framing

These requirements describe the smallest credible version of Pullstart.

They are intentionally scoped to one onboarding contract surface, one proof repo type, and one meaningful setup success path.

## Core requirements

### Contract boundary

- **CNTR-01**: Pullstart uses `setup.spec.yaml` as the canonical onboarding contract surface for MVP.
- **CNTR-02**: The contract can declare required tools, services, env expectations, ordered setup steps, and verification checks for the first proof repo.
- **CNTR-03**: The contract remains reviewable by humans and reliable for agent parsing.

### Planner requirements

- **PLAN-01**: Pullstart inspects repo evidence relevant to the proof repo, including runtime metadata, package manager signals, env templates, service configuration hints, and declared verification paths.
- **PLAN-02**: Pullstart inspects the local machine for prerequisites declared by the contract, including missing tools, incompatible versions, unavailable services, and missing env setup.
- **PLAN-03**: Pullstart produces a stepwise bootstrap plan that respects dependency order, identifies blockers before destructive work, and keeps the shortest safe path visible.

### Execution and verification requirements

- **EXEC-01**: Pullstart can run or guide the critical setup sequence declared by the contract.
- **EXEC-02**: Pullstart verifies one declared success path for the proof repo and reports what passed, failed, remained blocked, or still needs manual action.
- **EXEC-03**: Pullstart stops in a trustworthy blocked state when setup cannot continue safely.

### Blocker reporting requirements

- **BLKR-01**: Pullstart classifies failed setup into a small actionable blocker vocabulary.
- **BLKR-02**: Blocker output distinguishes machine prerequisites, service health issues, and repo-specific setup failures.
- **BLKR-03**: Blocker reports include the next useful step instead of a raw failure wall alone.

### Proof and scope honesty

- **PROOF-01**: MVP proof is one Node.js API + PostgreSQL proof repo before broader portability claims.
- **PROOF-02**: Public docs and planning artifacts clearly separate the MVP contract and proof slice from deferred platform ideas.

## Constraints

- MVP is optimized for one real proof repo type before broader portability
- `setup.spec.yaml` is the only canonical onboarding contract surface in MVP
- the proof repo is a Node.js API backed by PostgreSQL
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

These are explicitly out of MVP scope and must not leak into the proof repo promise:

- self-learning memory systems
- cross-repo shared knowledge graphs
- plugin ecosystems
- dashboards and admin surfaces
- generalized multi-agent workflow execution
- runtime substrate abstraction layers
- universal support claims across arbitrary stacks
