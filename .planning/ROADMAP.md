# Roadmap: Pullstart

## Overview

Pullstart reaches MVP by proving one contract-driven onboarding flow on one credible repo type before generalizing. The roadmap starts with contract and proof boundaries, then adds planner behavior, executor and verifier behavior, blocker reporting, and finally a real proof-repo validation pass.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Contract Model And MVP Slice** - Lock the onboarding contract, proof target, and execution boundaries in an implementation-ready form.
- [ ] **Phase 2: Minimal Onboarding Planner** - Turn contract plus machine and repo inspection into a safe ordered bootstrap plan.
- [ ] **Phase 3: Minimal Executor And Verifier** - Run or guide the setup path and verify the repo is runnable enough.
- [ ] **Phase 4: Failure Classification** - Normalize the most common onboarding blockers into clear actionable output.
- [ ] **Phase 5: First Proof Repo Validation** - Test the MVP against one real repo and trim abstractions that do not survive contact.

## Phase Details

### Phase 1: Contract Model And MVP Slice
**Goal**: Convert the current framing into an execution-ready MVP contract model, define the smallest contract schema that supports the proof repo, and pin down the exact success boundary for the first implementation cycle.
**Depends on**: Nothing (first phase)
**Requirements**: [CNTR-01, CNTR-02, CNTR-03]
**Success Criteria** (what must be TRUE):
  1. `setup.spec.yaml` is defined as the MVP source of truth with a minimal supported schema.
  2. The proof repo scenario is specific enough to drive implementation decisions without broad portability claims.
  3. Public docs and planning docs agree on what Pullstart is, what it is not, and what Phase 2 should build.
**Plans**: 3 plans

Plans:
- [ ] 01-01: Finalize the minimal `setup.spec.yaml` schema and contract rules for MVP.
- [ ] 01-02: Define the proof repo fixture and verification contract in implementation terms.
- [ ] 01-03: Align public docs and planning docs around the same narrow MVP slice.

### Phase 2: Minimal Onboarding Planner
**Goal**: Build the planner that reads the contract, inspects repo and machine state, and produces a shortest safe bootstrap plan.
**Depends on**: Phase 1
**Requirements**: [PLAN-01, PLAN-02, PLAN-03]
**Success Criteria** (what must be TRUE):
  1. Pullstart can parse the MVP contract shape needed by the proof repo.
  2. Pullstart can detect missing prerequisites and setup gaps before execution.
  3. Pullstart outputs an ordered plan with blockers and dependencies clearly identified.
**Plans**: 3 plans

Plans:
- [ ] 02-01: Implement contract parsing and repo evidence inspection.
- [ ] 02-02: Implement local machine prerequisite inspection.
- [ ] 02-03: Compose ordered setup planning and blocker-aware output.

### Phase 3: Minimal Executor And Verifier
**Goal**: Add the execution and verification loop that runs or guides setup steps, records outcomes, and reports whether the repo is runnable enough.
**Depends on**: Phase 2
**Requirements**: [EXEC-01, EXEC-02, EXEC-03]
**Success Criteria** (what must be TRUE):
  1. Pullstart can run or guide the core setup sequence in declared order.
  2. Pullstart verifies one success path that proves the app is usable for development.
  3. Pullstart stops safely with a clear blocked state when setup cannot complete.
**Plans**: 3 plans

Plans:
- [ ] 03-01: Build step execution flow with explicit safety boundaries.
- [ ] 03-02: Build verification flow for the declared success path.
- [ ] 03-03: Build trustworthy setup outcome reporting for success and blocked states.

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
- [ ] 04-01: Define blocker taxonomy and matching rules for MVP.
- [ ] 04-02: Integrate blocker classification into planner and execution reporting.

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
- [ ] 05-01: Run the MVP against the proof repo and capture real failure patterns.
- [ ] 05-02: Refine contract and docs based on proof findings without broadening scope.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Contract Model And MVP Slice | 0/3 | In progress | - |
| 2. Minimal Onboarding Planner | 0/3 | Not started | - |
| 3. Minimal Executor And Verifier | 0/3 | Not started | - |
| 4. Failure Classification | 0/2 | Not started | - |
| 5. First Proof Repo Validation | 0/2 | Not started | - |
