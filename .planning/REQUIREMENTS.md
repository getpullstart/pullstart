# Pullstart Requirements

## MVP requirement framing

These requirements describe the strict MVP of Pullstart as an evidence-driven onboarding engine.

The scope remains narrow:

- one declared-intent surface (`setup.spec.yaml` candidate)
- one proof repo type (Node.js API + PostgreSQL)
- one trustworthy verification boundary
- explicit blocked and unknown outcomes

## Core requirement families

### Declared intent and contract boundary

- **CNTR-01**: Pullstart consumes declared onboarding intent from `setup.spec.yaml` when present, with strict parse/schema/version validation.
- **CNTR-02**: Contract state is explicit (`missing`, `valid`, `partial`, `invalid`, `contradictory`, `stale-suspected`).
- **CNTR-03**: Contract authority is limited to declared setup intent and cannot by itself claim runtime truth or execution safety.

### Evidence model and provenance

- **EVD-01**: Pullstart tracks canonical fact sources: `declared`, `observed-repo`, `observed-machine`, `runtime-observed`, `inferred`.
- **EVD-02**: Provenance survives through verdict, planning, execution, verification, and blocker output.
- **EVD-03**: Contradictions between declared and observed evidence are represented explicitly, never silently dropped.
- **EVD-04**: Repo inspection must distinguish `observed artifact` vs `inferred likely path` vs `declared supported path`.

### Unknown-state handling

- **UNKN-01**: Unknown is first-class (`not observed` is not collapsed into `impossible`).
- **UNKN-02**: `unresolved-until-execution` is a valid state for access/network/auth classes.
- **UNKN-03**: Capability, planning, and blocker surfaces must preserve unknowns rather than hiding them in narrative.

### Capability verdict engine

- **CAP-01**: Pullstart emits typed capability verdicts before planning/execution.
- **CAP-02**: Verdict families must cover at least: `ready`, `ready-with-manual-step`, `blocked-by-machine-prereq`, `blocked-by-repo-gap`, `blocked-by-external-access`, `unsafe-to-execute`, `unknown-requires-review`.
- **CAP-03**: Verdict is structured first and explanation second; planning may not silently override verdict truth.

### Policy gate and execution eligibility

- **POL-01**: Every step is policy classified as one of: `auto-runnable`, `confirmation-required`, `manual-only`, `blocked`, `forbidden`.
- **POL-02**: Policy gate owns execution permission; planner/agent/contract alone cannot grant permission.
- **POL-03**: Sensitive mutation surfaces must be explicitly gated, not implied by heuristics.

### Planning requirements

- **PLAN-01**: Plan generation consumes evidence + capability + policy and outputs shortest safe path.
- **PLAN-02**: Every step must be traceable to declared clause, observed evidence, policy class, and prerequisite verdict.
- **PLAN-03**: Multi-path candidates are explainable, with explicit rationale for chosen path.

### Execution requirements

- **EXEC-01**: Execution runs only policy-allowed and eligibility-approved steps.
- **EXEC-02**: Execution records runtime-observed evidence per step boundary (command, exit, logs, reconciliation).
- **EXEC-03**: Runtime-observed truth outranks prior assumptions when contradictory.
- **EXEC-04**: Execution remains bounded, conservative, and stop-on-failure/ambiguity in MVP.

### Verification and trust boundary

- **VER-01**: Verification target must be explicit (declared command/health target).
- **VER-02**: Verification owns runnable-enough proof; completed commands/log lines are not proof.
- **VER-03**: Verification states must distinguish at least: `healthy`, `healthy-but-ownership-unknown`, `failed`, `not-provable`.
- **VER-04**: Pre-healthy or ownership-ambiguous verification target cannot become fake success.

### Blocker truth requirements

- **BLKR-01**: Blocker explanation is downstream of evidence + verdict + execution + verification and must not invent certainty.
- **BLKR-02**: Blockers separate `observed fact`, `likely cause`, `next check`, and `manual action`.
- **BLKR-03**: Blocker output includes class, evidence list, blocked step, next action type, and explicit unknowns.

### Agent boundary requirements

- **AGNT-01**: Agent review is default for explanation, summarization, ambiguity handling, and alternative comparison.
- **AGNT-02**: Agent may not silently become hidden planner-of-record or override deterministic truth/policy safety.
- **AGNT-03**: Agent assistance is advisory; deterministic system owns state/evidence/capability/execution eligibility.

### Enterprise-aware blocker spine (MVP-aware)

- **ENT-01**: Auth presence vs auth usability are distinct blocker families.
- **ENT-02**: VPN/network reachability and private-registry reachability are first-class blockers.
- **ENT-03**: Registry auth failure and permission denied are first-class blockers.
- **ENT-04**: Sibling/private dependency missing is first-class blocker.
- **ENT-05**: External access uncertainty may remain unresolved until execution and must stay explicit.

### Proof and scope honesty

- **PROOF-01**: MVP proof remains one Node.js API + PostgreSQL repo before portability claims.
- **PROOF-02**: Public and planning artifacts must separate `proven now`, `manual required`, `deferred`, and `unresolved ambiguities`.

## Phase 1 REALIGN crosswalk

- `CNTR-REALIGN` -> `CNTR-01..03`
- `EVD-REALIGN` -> `EVD-01..04` + `UNKN-01..03`
- `CAP-REALIGN` -> `CAP-01..03`
- `POL-REALIGN` -> `POL-01..03`
- `VER-REALIGN` -> `VER-01..04`

## Constraints

- MVP stays onboarding-first; no broad platform repositioning.
- Declared intent matters but is never the only runtime truth source.
- Deterministic truth and policy safety outrank narrative convenience.
- Blocked and unknown outcomes are valid product results.
- Verification is required for trust; optimistic completion is forbidden.

## Deferred requirements (explicitly out of MVP)

- generalized platform control plane
- memory product positioning
- plugin ecosystem
- universal stack support claims
- hidden autonomous agent orchestration
