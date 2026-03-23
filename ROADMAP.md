# Pullstart Roadmap

## Roadmap framing

This roadmap follows a stricter architecture sequence for an evidence-driven onboarding engine:

1. authority model
2. evidence model
3. capability verdict
4. policy-gated planning
5. policy-gated execution
6. verification and blocker truth
7. one proof repo hardening

Each phase must preserve MVP guardrails:

- narrow onboarding scope
- deterministic truth ownership
- agent review by default (advisory, not hidden authority)
- policy-gated execution
- verification as trust boundary
- blocked/unknown as first-class outcomes

## Phase 1 — Authority and evidence contract

### Purpose

Define who owns truth, what contract authority means, and how declared intent is bounded.

### Scope

- authority model and product framing alignment
- `setup.spec.yaml` as declared-intent candidate surface
- explicit contract confidence states
- explicit non-goals and uncertainty language

### Success condition

Pullstart no longer reads as planner-first or autonomy-first; it reads as deterministic evidence system with bounded agent review.

## Phase 2 — Deterministic evidence core

### Purpose

Build canonical evidence normalization and provenance preservation across declared, observed, inferred, and runtime facts.

### Scope

- repo inspection evidence model
- machine inspection evidence model
- contradiction representation
- unknown-state propagation
- provenance tagging rules

### Success condition

Every fact consumed downstream is typed by source and confidence; contradictions and unknowns survive all stages.

## Phase 3 — Capability verdict engine

### Purpose

Translate evidence into typed readiness/eligibility outcomes before planning/execution.

### Scope

- typed verdict families
- contradiction-to-block mapping
- unknown-requires-review mapping
- enterprise-aware blocker families (auth/network/permission/private deps)

### Success condition

Proceed/ask/block/unknown truth is deterministic and structured first, narrative second.

## Phase 4 — Policy-gated planner with agent review

### Purpose

Derive shortest safe path from evidence + verdict + policy, with agent review for explanation and alternatives.

### Scope

- dependency graph and eligibility mapping
- step traceability to evidence/verdict/policy
- policy classification integration (`auto-runnable`, `confirmation-required`, `manual-only`, `blocked`, `forbidden`)
- review-friendly rationale output

### Success condition

Planner owns ordered candidates, not truth authority; every step has deterministic provenance.

Policy gate owns execution permission; planner/agent/contract do not grant execution permission on their own.

## Phase 5 — Policy-gated execution

### Purpose

Run only policy-allowed high-confidence actions and record runtime-observed truth.

### Scope

- bounded execution orchestration
- step-boundary logging and runtime evidence capture
- expected vs observed reconciliation
- stop-on-failure and stop-on-ambiguity behavior

### Success condition

Execution is conservative, low-surprise, and never outruns policy or capability truth.

## Phase 6 — Verification and blocker truth

### Purpose

Establish verification as proof boundary and blocker explanation as deterministic downstream truth.

### Scope

- explicit verification target states
- ownership ambiguity handling (healthy-but-ownership-unknown)
- blocker schema with observed facts, likely causes, next checks, manual actions
- unknown-preserving output semantics

### Success condition

“Commands ran” is not treated as success; only verification can grant runnable-enough proof.

## Phase 7 — One proof repo hardening

### Purpose

Validate the complete architecture on one real proof repo and tighten truth boundaries without scope broadening.

### Scope

- one locked proof target
- success + blocked + unknown evidence capture
- evidence-gated doc/contract refinement
- explicit proven/manual/deferred/unresolved framing

### Success condition

One proof repo path is trustworthy and honest; portability claims remain deferred.

## What stays deferred beyond MVP

- multi-repo portability claims
- platform control plane stories
- memory product positioning
- plugin ecosystem
- hidden autonomous planner-of-record behavior

## Exit criteria for this architecture cycle

Pullstart is aligned when:

- authority boundaries are explicit and enforced
- deterministic evidence model survives the pipeline
- capability and policy gates precede execution
- blocked/unknown are first-class and visible
- verification remains the only trust boundary
- proof repo hardening is documented without false certainty
