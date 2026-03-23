# Requirements: Pullstart

**Defined:** 2026-03-23
**Core Value:** Get a real repo from clone to working local setup faster and with fewer dead ends than the repo's existing onboarding path.

## v1 Requirements

### Contract Model

- [x] **CNTR-01**: Pullstart uses `setup.spec.yaml` as the canonical onboarding contract surface for MVP.
- [x] **CNTR-02**: The contract can declare required tools, services, env expectations, ordered setup steps, and verification checks for the first proof repo.
- [x] **CNTR-03**: The contract remains reviewable by humans and reliable for agent parsing.

### Planning

- [ ] **PLAN-01**: Pullstart can inspect repo evidence relevant to the declared setup contract.
- [ ] **PLAN-02**: Pullstart can inspect local machine prerequisites required by the contract.
- [ ] **PLAN-03**: Pullstart can produce an ordered bootstrap plan that identifies blockers before unsafe work.

### Execution And Verification

- [ ] **EXEC-01**: Pullstart can run or guide the critical setup sequence declared by the contract.
- [ ] **EXEC-02**: Pullstart can verify one declared success path that proves the repo is runnable enough for development.
- [ ] **EXEC-03**: Pullstart can stop in a trustworthy blocked state when setup cannot complete safely.

### Blocker Reporting

- [ ] **BLKR-01**: Pullstart classifies common onboarding failures into a small actionable blocker vocabulary.
- [ ] **BLKR-02**: Blocker output distinguishes machine prerequisites, service health issues, and repo-specific setup failures.
- [ ] **BLKR-03**: Blocker reports include the next useful action instead of raw failure walls alone.

### Proof And Scope Honesty

- [ ] **PROOF-01**: Pullstart is validated on one Node.js API + PostgreSQL proof repo before broader portability claims.
- [ ] **PROOF-02**: Public docs and planning artifacts clearly separate the MVP contract and proof slice from future platform ideas.

## v2 Requirements

### Future Platform Possibilities

- **FUTR-01**: Generate onboarding contracts from repo evidence.
- **FUTR-02**: Learn recurring setup failures across repeated runs.
- **FUTR-03**: Expand to repo-family portability beyond the first proof repo type.
- **FUTR-04**: Add richer recovery and resume behavior after failed onboarding attempts.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Generic agent operating system | Not required to prove onboarding value and would blur the product wedge |
| Cross-repo memory platform | Interesting later, but not part of the first user win |
| Plugin marketplace | Platform overhead before the core workflow is proven |
| Team dashboard/control plane | Adds surface area without improving clone-to-working flow |
| Broad autonomous coding agent behavior | Pullstart is an onboarding product first, not a general coding agent |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CNTR-01 | Phase 1 | Complete |
| CNTR-02 | Phase 1 | Complete |
| CNTR-03 | Phase 1 | Complete |
| PLAN-01 | Phase 2 | Pending |
| PLAN-02 | Phase 2 | Pending |
| PLAN-03 | Phase 2 | Pending |
| EXEC-01 | Phase 3 | Pending |
| EXEC-02 | Phase 3 | Pending |
| EXEC-03 | Phase 3 | Pending |
| BLKR-01 | Phase 4 | Pending |
| BLKR-02 | Phase 4 | Pending |
| BLKR-03 | Phase 4 | Pending |
| PROOF-01 | Phase 5 | Pending |
| PROOF-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-23*
*Last updated: 2026-03-23 after Phase 1 contract/proof alignment*
