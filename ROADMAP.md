# Pullstart Roadmap

## Roadmap framing

This roadmap is built around one believable MVP:

**Help a developer go from cloned repo to working local setup through a contract-driven onboarding flow.**

Every MVP phase must support:

- the `setup.spec.yaml` contract surface
- the first proof scenario
- a trustworthy setup result or blocker report

## Phase 1 — Product framing and contract model

### Purpose

Define the product sharply, lock the MVP thesis, and establish `setup.spec.yaml` as the canonical onboarding contract.

### Scope

- product framing and README
- MVP thesis and falsification check
- explicit non-goals
- contract principles
- first `setup.spec.yaml` example schema and examples
- first proof scenario documentation

### Success condition

The repo clearly states what Pullstart is, what it is not, what contract it reads, and what the first meaningful proof looks like.

## Phase 2 — Minimal onboarding planner

### Purpose

Turn repo contracts plus machine inspection into an ordered bootstrap plan.

### Scope

- parse minimal `setup.spec.yaml`
- inspect local machine prerequisites
- inspect repo metadata needed for the proof scenario
- detect missing tools, env setup gaps, and service prerequisites
- produce a stepwise plan with dependency ordering

### Success condition

Given the proof repo contract, Pullstart can explain the shortest safe bootstrap path before taking action.

## Phase 3 — Minimal executor and verifier

### Purpose

Run or guide the most important setup steps, then verify whether the repo is runnable enough.

### Scope

- guided versus automatic execution mode
- run critical bootstrap commands in sequence
- capture outcomes step by step
- execute one declared verification path
- summarize pass, fail, and blocked states cleanly

### Success condition

Pullstart can complete the proof scenario's declared setup path or stop safely with a structured blocker report.

## Phase 4 — Failure classification

### Purpose

Normalize the most common onboarding failures so the agent can explain what is wrong without vague log walls.

### Scope

- missing toolchain versions
- env file missing or incomplete
- Docker not running
- database or dependent service unhealthy
- install failure
- migration failure
- verification command failure

### Success condition

Failures in the proof scenario map to a small, understandable blocker vocabulary with actionable next steps.

## Phase 5 — One real repo proof

### Purpose

Prove the MVP against one real repository and remove abstractions that do not survive contact with actual onboarding friction.

### Scope

- test against the chosen Node.js API proof repo
- refine contract fields based on real failure cases
- cut fake generality
- tighten verification expectations
- document what still requires manual intervention

### Success condition

A real repo onboarding flow completes more reliably with Pullstart than with the repo's baseline README-only path.

## What belongs after MVP

These ideas stay outside the initial milestone:

- multi-repo portability claims
- contract generation or auto-authoring
- persistent learning or self-improving behavior
- team dashboards and workflow views
- plugin ecosystems
- broad platform positioning
- memory-heavy agent OS behavior
- generalized autonomous engineering flows

## Ordering rationale

The order is intentional:

1. Lock the contract and product story first.
2. Build planning before execution so actions stay explainable.
3. Build execution before richer failure taxonomy so behavior is grounded in real steps.
4. Test on one real repo before broadening portability or architecture.

## MVP exit criteria

Pullstart is ready to claim an MVP when all of the following are true:

- the contract surface is stable enough for the proof repo
- the planner creates a credible ordered setup path
- the executor can guide or run the key bootstrap steps
- verification can confirm a working local state
- common failures are classified into actionable blocker types
- the proof repo result is documented honestly
