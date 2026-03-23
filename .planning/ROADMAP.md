# Roadmap: Pullstart

## Overview

Pullstart reaches MVP by proving one contract-aware, discovery-assisted, capability-checked onboarding flow on one credible repo type before generalizing. The roadmap starts with contract and proof boundaries, then adds discovery and planning, a real capability verdict plus bounded execution loop, blocker reporting, and finally a real proof-repo validation pass.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Contract Model And MVP Slice** - Lock the onboarding contract, proof target, and execution boundaries in an implementation-ready form. (completed 2026-03-23)
- [x] **Phase 2: Minimal Onboarding Planner** - Consume the frozen contract and proof checklist to produce a safe ordered bootstrap plan. (completed 2026-03-23)
- [x] **Phase 3: Capability Verdict, Executor, And Verification** - Decide whether Pullstart can act, run or guide the shortest safe path, and verify one runnable success signal. (completed 2026-03-23)
- [x] **Phase 4: Failure Classification** - Normalize the most common onboarding blockers into clear actionable output. (completed 2026-03-23)
- [x] **Phase 5: First Proof Repo Validation** - Test the MVP against one real repo and trim abstractions that do not survive contact. (completed 2026-03-23)

## Phase Details

### Phase 1: Contract Model And MVP Slice
**Goal**: Convert the current framing into an execution-ready onboarding contract concept, define the smallest contract schema that supports the proof repo, and pin down the exact success boundary for the first implementation cycle.
**Depends on**: Nothing (first phase)
**Requirements**: [CNTR-01, CNTR-02, CNTR-03]
**Success Criteria** (what must be TRUE):
  1. A machine-readable onboarding contract concept is defined for MVP, with `setup.spec.yaml` validated as the current candidate artifact.
  2. The proof repo scenario is specific enough to drive implementation decisions without broad portability claims.
  3. Public docs and planning docs agree on what Pullstart is, what it is not, and what Phase 2 should build.
**Plans**: 3 plans

Plans:
- [x] 01-01: Finalize the minimal `setup.spec.yaml` schema and contract rules for MVP.
- [x] 01-02: Define the proof repo fixture and verification contract in implementation terms.
- [x] 01-03: Align public docs and planning docs around the same narrow MVP slice.

### Phase 2: Minimal Onboarding Planner
**Goal**: Build the planner that reads the current contract candidate, consumes the proof-repo checklist, inspects repo and machine state, and produces a shortest safe bootstrap plan without redefining the contract boundary.
**Depends on**: Phase 1
**Requirements**: [PLAN-01, PLAN-02, PLAN-03]
**Success Criteria** (what must be TRUE):
  1. Pullstart can parse the MVP contract shape needed by the proof repo.
  2. Pullstart can inspect repo and machine evidence without making discovery the truth owner.
  3. Pullstart outputs an ordered plan with blockers and dependencies clearly identified.
  4. Phase 2 does not redefine the contract or broaden the proof repo boundary set in Phase 1.
**Plans**: 3 plans

Plans:
- [x] 02-01: Implement contract parsing and repo evidence inspection.
- [x] 02-02: Implement local machine prerequisite inspection.
- [x] 02-03: Compose ordered setup planning and blocker-aware output.

### Phase 3: Capability Verdict, Executor, And Verification
**Goal**: Add the capability verdict and bounded execution loop that decides whether Pullstart can act, runs or guides the shortest safe bootstrap path, and verifies one explicit runnable success signal.
**Depends on**: Phase 2
**Requirements**: [CAP-01, CAP-02, EXEC-01, EXEC-02, EXEC-03, EXEC-04]
**Success Criteria** (what must be TRUE):
  1. Pullstart can produce a capability verdict grounded in toolchain, environment, auth/access, network, and permission evidence.
  2. Pullstart can run or guide the shortest safe bootstrap sequence in declared order with bounded, visible side effects.
  3. Pullstart verifies one success path that proves the app is runnable enough for development.
  4. Pullstart stops safely with a clear blocked state when setup cannot complete.
**Plans**: 3 plans

Plans:
- [x] 03-01: Build capability verdict generation over planner and machine/session evidence.
- [x] 03-02: Build bounded execution flow for the shortest safe bootstrap path.
- [x] 03-03: Build verification and outcome reporting for one explicit runnable success signal.

### Phase 4: Failure Classification
**Goal**: Turn frequent setup failures into small, understandable blocker categories with useful guidance.
**Depends on**: Phase 3
**Requirements**: [BLKR-01, BLKR-02, BLKR-03]
**Success Criteria** (what must be TRUE):
  1. Common onboarding failures map to a stable blocker vocabulary.
  2. Reports distinguish prerequisite issues, service-health issues, and repo-specific failures.
  3. Each blocker type includes the next useful action instead of only raw logs.
**Plans**: 2 plans

Plans:
- [x] 04-01: Define blocker taxonomy and matching rules for MVP.
- [x] 04-02: Integrate blocker classification into planner and execution reporting.

### Phase 5: First Proof Repo Validation
**Goal**: Validate Pullstart on one real proof repo, remove fake generality, and document the honest MVP boundary after contact with reality.
**Depends on**: Phase 4
**Requirements**: [PROOF-01, PROOF-02]
**Success Criteria** (what must be TRUE):
  1. Pullstart is exercised against a real Node.js API + PostgreSQL repo.
  2. The contract and onboarding flow are refined based on real failure cases.
  3. Docs clearly state what is proven, what still requires manual intervention, and what remains deferred.
**Plans**: 2 plans

Plans:
- [x] 05-01: Run the MVP against the proof repo and capture real failure patterns.
- [x] 05-02: Refine contract and docs based on proof findings without broadening scope.

Proof status framing:
- **Proven now:** one locked Node.js API + PostgreSQL proof target has both success and blocked evidence.
- **Manual required:** users must manage environment/process readiness for attributable startup verification.
- **Deferred:** no portability claims beyond this single proof slice.
- **Unresolved ambiguities:** pre-healthy verification targets remain ambiguous and intentionally blocked pending rerun.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Contract Model And MVP Slice | 3/3 | Complete | 2026-03-23 |
| 2. Minimal Onboarding Planner | 3/3 | Complete | 2026-03-23 |
| 3. Capability Verdict, Executor, And Verification | 3/3 | Complete | 2026-03-23 |
| 4. Failure Classification | 2/2 | Complete | 2026-03-23 |
| 5. First Proof Repo Validation | 2/2 | Complete | 2026-03-23 |

## Backlog

### Phase 999.2: Post-phase UX polish: installation summary output, rich colored logging, user preference tracking, and CLI-first up/skip-rerun behavior (BACKLOG)

**Goal:** [Captured for future planning]
**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)
