# Pullstart Project

## Product statement

Pullstart is an evidence-driven onboarding engine for getting a freshly cloned repo to one verified local working state with less guessing.

It starts from declared setup intent when available, inspects repo and machine reality, produces typed capability truth, reviews the safest path with agent assistance, runs only policy-allowed steps, and stops with a clear blocker when proof is missing.

## Target user

The first target user is a developer who has just cloned a repo and wants to get it running locally without spending an hour decoding setup docs, guessing tool versions, or discovering missing services through failure.

This user is comfortable in a terminal, but should not need deep repo history or tribal knowledge to reach a working setup.

## Product promise

Pullstart starts with one narrow promise:

**Evidence-driven onboarding with deterministic truth, policy-gated execution, and verification as proof.**

The initial promise is simple:

**Clone a repo. Get one honest outcome: verified readiness, or explicit blocker/unknown state.**

## MVP thesis

- Target user: a developer onboarding into an existing application repo with non-trivial setup requirements
- Product promise: consume declared intent plus observed evidence and produce deterministic capability and execution eligibility
- First success moment: the developer reaches one verified readiness target or receives a structured blocker/unknown outcome instead of a vague failure wall
- First proof repo type: a Node.js API service backed by PostgreSQL with env setup, migrations, and a health endpoint
- MVP truth model: declared truth + observed repo truth + observed machine truth + runtime-observed truth + explicit inferred facts
- Current declared-intent surface: `setup.spec.yaml` (candidate filename), with docs and architecture notes secondary
- Phase boundary: v1.1 realignment starts from authority/evidence model before further implementation
- Why now: more teams are using agents, but repo setup is still fragmented across README notes, shell scripts, and implicit expectations
- Why narrower than adjacent ideas: Pullstart is not trying to cover every developer workflow or become a broad platform; it is focused on one painful transition point from clone to verified local setup

## Falsification check

### Assumptions that are still hypotheses

- a declared intent surface plus deterministic evidence model can cover enough onboarding friction to beat README-only setup
- developers will trust policy-gated automation if unknown and blocked outcomes are explicit
- one proof repo type is enough to define a useful MVP before broader portability
- enterprise-like access failures (auth/network/permission/private deps) can be represented as first-class blocker families without broadening scope

### What would falsify or narrow the framing

- if deterministic evidence cannot sustain trustworthy verdicts without hidden planner-of-record behavior
- if teams refuse declared intent maintenance because upkeep cost outweighs onboarding benefit
- if capability verdicts collapse unknown states into fake certainty
- if verification cannot act as trust boundary (for example, pre-healthy ownership ambiguity keeps producing false positives)

### What should remain intentionally undecided until first-repo evidence exists

- whether contract authoring should be manual, generated, or mixed
- how aggressive inferred facts may become before crossing policy safety boundaries
- how much repo inference should supplement declared intent before review is mandatory
- whether executor behavior should default to guided or policy-approved auto for specific mutation classes
- how broad the first portability layer should be beyond the proof repo type

## Authority model (canonical)

1. Deterministic evidence system owns state, evidence provenance, capability truth, and execution eligibility.
2. Agent review is default for explanation, ambiguity handling, and comparison, but remains advisory.
3. Policy gate owns permission to execute.
4. Verification owns runnable-enough proof.
5. Blocked and unknown are first-class product outcomes.

Deterministic evidence owns truth. declared intent is bounded authority. unknown and blocked outcomes are first-class.

## Deterministic truth layers

Pullstart must keep these truth layers explicit and inspectable:

- declared truth (contract and declared intent)
- observed repo truth
- observed machine truth
- runtime-observed truth
- inferred truth (explicitly tagged and never silently upgraded to observed truth)

Truth provenance must survive through verdict, planning, execution, and blocker explanation.

## Current declared-intent surface

Pullstart MVP currently uses `setup.spec.yaml` as the onboarding contract candidate.

The current Phase 1 contract boundary is:

- one versioned `setup.spec.yaml` surface
- one strict schema-backed contract definition
- one canonical proof fixture for the Node.js API + PostgreSQL slice

### Why it still matters

- it is structured enough for reliable machine parsing
- it stays readable in code review
- it can express prerequisites, ordered steps, services, env expectations, and verification targets in one place
- it avoids treating onboarding as unstructured prose or hidden shell logic

But this surface is authority for declared intent only. It is not authority for runtime reality or execution safety by itself.

### Secondary surfaces

- `README.md`: product-level framing and human entry point
- `ONBOARDING.md`: optional human runbook or repo-specific explanation
- `AGENTS.md`: optional agent behavior notes and operational conventions

In MVP, those files are secondary, derived, or explanatory. `setup.spec.yaml` is authority for declared setup intent, not full runtime truth.

## Architecture sequence (v1.1 planning truth)

1. authority model
2. evidence model
3. capability verdict
4. policy-gated planning
5. policy-gated execution
6. verification and blocker truth
7. one proof repo hardening

This sequence replaces planner-first storytelling and keeps deterministic truth ahead of narrative.

## First proof scenario

### Target repo

A Node.js API service with PostgreSQL, `.env.example`, a migration step, and a health endpoint.

### Starting state

A developer has cloned the repo on a machine that may be missing one or more prerequisites such as the correct Node version, Docker running status, PostgreSQL availability, copied env file, or migrated database.

### What Pullstart reads

- declared setup intent (`setup.spec.yaml` when available)
- repo-observed evidence (`package.json`, lockfiles, env templates, scripts, health targets)
- machine-observed evidence (tools, versions, env presence, reachability, access signals)

### What Pullstart decides

- typed capability verdict (ready / manual-required / blocked / unsafe / unknown-review-required)
- policy eligibility per step (auto / ask-first / manual-only / forbidden)
- whether verification can prove readiness or must stop with blocker/unknown

### What Pullstart runs or guides

- only policy-allowed high-confidence steps
- bounded execution with runtime evidence capture
- explicit stop-on-failure and stop-on-ambiguity behavior

### Meaningful MVP win

Pullstart produces a safe policy-gated path and ends in one of three trustworthy states:

- verified runnable-enough state
- explicit blocker with evidence and next action
- explicit unknown state requiring review/manual step

That is the first proof scenario, not an already-earned portability claim.

The implementation-facing checklist for that proof repo is now explicit as well, so later phases do not need to reinterpret this scenario from scratch.

## Product principles

1. The user-facing workflow must feel simple.
2. Complexity can exist in the system, but not in the default path.
3. Deterministic evidence owns truth; agent narrative does not.
4. Declared intent plus observed evidence beats markdown-only or heuristic-only onboarding.
5. The first release solves onboarding and setup, not all repo intelligence.
6. MVP usefulness on one real repo matters more than premature generality.
7. Unknown and blocked outcomes are valid product results.
8. Verification is proof; command completion is not proof.
9. Future platform ideas may be documented, but not implemented in the MVP.
10. Deferred scope must be named honestly.

## Explicit non-goals

Pullstart MVP is not:

- a broad developer platform
- a second-brain style memory product
- a cross-repo consensus engine
- a runtime substrate selector
- a plugin platform
- a team-wide workflow operating system
- a giant dashboard product
- a generic project execution engine
- a broad developer platform repositioning
- a full autonomous coding agent replacement

## Enterprise-aware MVP blocker spine

Without broadening scope, Pullstart must treat these as first-class blocker families:

- auth absent
- auth present but unusable
- VPN or network unreachable
- private registry unreachable
- registry auth failed
- permission denied
- sibling or private dependency missing
- unresolved until execution

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
