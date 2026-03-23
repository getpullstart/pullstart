# Pullstart Project

## Product statement

Pullstart is a repo-aware onboarding agent that reads setup contracts, checks the local environment, plans the shortest safe bootstrap path, executes or guides setup steps, and verifies the result.

## Target user

The first target user is a developer who has just cloned a repo and wants to get it running locally without spending an hour decoding setup docs, guessing tool versions, or discovering missing services through failure.

This user is comfortable in a terminal, but should not need deep repo history or tribal knowledge to reach a working setup.

## Wedge

Pullstart starts with one narrow wedge:

**Contract-driven repo onboarding with agent-guided setup and verification.**

The initial product promise is simple:

**Clone a repo. Let the agent get it running.**

## MVP thesis

- Target user: a developer onboarding into an existing application repo with non-trivial setup requirements
- Wedge: read a declared setup contract, inspect local state, and drive the shortest safe path from clone to runnable
- First success moment: the developer sees the repo boot locally and pass one declared verification flow, or gets a structured blocker report instead of a vague failure wall
- First proof repo type: a Node.js API service backed by PostgreSQL with env setup, migrations, and a health endpoint
- Why now: more teams are using agents, but repo setup is still fragmented across README notes, shell scripts, and implicit expectations
- Why narrower than adjacent ideas: Pullstart is not trying to run all software work, manage memory across projects, or become an agent platform; it is focused on one painful transition point from clone to working local setup

## Falsification check

### Assumptions that are still hypotheses

- a single contract surface can cover enough real onboarding friction to beat README-only setup
- developers will trust a setup agent if the plan is explicit, reversible where possible, and verification is clear
- one proof repo type is enough to define a useful MVP before broader portability
- common setup failures can be normalized into a small, meaningful blocker vocabulary

### What would falsify or narrow the framing

- if the first proof repo still needs heavy repo-specific code despite a clean contract
- if teams refuse to maintain a setup contract because the value is too low or upkeep is too high
- if the agent cannot reliably distinguish between machine prerequisites, service health issues, and repo-specific setup failures
- if verification is too shallow to create trust or too expensive to run routinely

### What should remain intentionally undecided until first-repo evidence exists

- whether contract authoring should be manual, generated, or mixed
- how much repo inference should supplement the contract
- whether executor behavior should default to fully guided, semi-automatic, or aggressively automatic
- how broad the first portability layer should be beyond the proof repo type

## Canonical onboarding contract surface

Pullstart MVP chooses `setup.spec.yaml` as the canonical onboarding contract surface.

### Why it wins

- it is structured enough for reliable machine parsing
- it stays readable in code review
- it can express prerequisites, ordered steps, services, env expectations, and verification commands in one place
- it avoids treating onboarding as unstructured prose or hidden shell logic

### Secondary surfaces

- `README.md`: product-level framing and human entry point
- `ONBOARDING.md`: optional human runbook or repo-specific explanation
- `AGENTS.md`: optional agent behavior notes and operational conventions

In MVP, those files are secondary, derived, or explanatory. `setup.spec.yaml` is the source of truth for setup intent.

## First proof scenario

### Target repo

A Node.js API service with PostgreSQL, `.env.example`, a migration step, and a health endpoint.

### Starting state

A developer has cloned the repo on a machine that may be missing one or more prerequisites such as the correct Node version, Docker running status, PostgreSQL availability, copied env file, or migrated database.

### What Pullstart reads

- `setup.spec.yaml`
- package manager and runtime metadata
- `.env.example`
- repo hints such as `package.json`, Docker files, and migration scripts

### What Pullstart decides

- whether the machine meets declared prerequisites
- whether local services should be started directly or via Docker
- which bootstrap steps are mandatory before app launch
- whether the success path is reachable now or blocked

### What Pullstart runs or guides

- toolchain checks
- env file setup guidance
- dependency install
- local service start commands
- database migration
- application start command
- verification command or health check

### Meaningful MVP win

Pullstart produces a safe ordered plan, executes or guides the required setup flow, and ends in one of two trustworthy states:

- the app starts locally and the declared health check passes
- the setup stops with a structured blocker report that clearly identifies the missing prerequisite or failing step

## Product principles

1. The user-facing workflow must feel simple.
2. Complexity can exist in the system, but not in the default path.
3. Repo contracts are the source of truth.
4. Structured spec plus human-readable docs beats markdown-only or heuristics-only onboarding.
5. The first release solves onboarding and setup, not all repo intelligence.
6. MVP usefulness on one real repo matters more than premature generality.
7. Future platform ideas may be documented, but not implemented in the MVP.
8. Deferred scope must be named honestly.

## Explicit non-goals

Pullstart MVP is not:

- a generic agent operating system
- a second-brain or project memory platform
- a cross-repo consensus engine
- a runtime substrate selector
- a plugin platform
- a team-wide workflow operating system
- a giant dashboard product
- a generic project execution engine
- a broad developer platform repositioning
- a full autonomous coding agent replacement

## MVP success definition

The MVP is successful when Pullstart can onboard one real repo type credibly enough that a new developer reaches a working local setup faster and with fewer dead ends than the repo's existing onboarding path.

That success must be visible through:

- a clear contract surface
- a believable plan
- safe setup behavior
- meaningful verification
- precise blocker explanations when setup does not complete

## Future directions

Possible later directions belong after MVP proof, not inside it:

- stronger memory and recovery layers
- contract generation from repo evidence
- learned failure patterns
- broader repo-family portability
- richer verification depth
- runtime helper layers for repeated setup environments

These are future possibilities, not MVP commitments.
