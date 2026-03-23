# Requirements: Pullstart

**Defined:** 2026-03-23
**Core Value:** Get a real repo from clone to working local setup faster and with fewer dead ends than the repo's existing onboarding path.

## v1 Requirements

### Contract Model

- [x] **CNTR-01**: Pullstart uses a machine-readable onboarding contract concept for V1, with `setup.spec.yaml` as the current candidate artifact rather than a permanently locked filename.
- [x] **CNTR-02**: The contract can declare required tools, services, env expectations, ordered setup steps, and verification checks for the first proof repo.
- [x] **CNTR-03**: The contract remains reviewable by humans and reliable for agent parsing.

### Planning

- [x] **PLAN-01**: Pullstart can inspect repo evidence relevant to the declared onboarding contract without turning discovery into authority.
- [x] **PLAN-02**: Pullstart can inspect local machine prerequisites relevant to the proof bootstrap path.
- [x] **PLAN-03**: Pullstart can produce an ordered bootstrap plan that identifies blockers before unsafe work.

### Capability Verdict

- [x] **CAP-01**: Pullstart can produce an explicit capability verdict that says whether it can act now, must pause, or needs one user action next.
- [x] **CAP-02**: The capability verdict accounts for toolchain, environment, auth/access, network, and permission reality without fake certainty.

### Execution And Verification

- [x] **EXEC-01**: Pullstart can run or guide the shortest safe bootstrap path declared by the contract and constrained by discovery plus capability verdicts.
- [x] **EXEC-02**: Pullstart can verify one declared success path that proves the repo is runnable enough for development.
- [x] **EXEC-03**: Pullstart keeps risky actions bounded, visible, and free of hidden side effects.
- [x] **EXEC-04**: Pullstart can stop in a trustworthy blocked state when setup cannot complete safely.

### Blocker Reporting

- [x] **BLKR-01**: Pullstart classifies common onboarding failures into a small actionable blocker vocabulary.
- [x] **BLKR-02**: Blocker output distinguishes machine prerequisites, service health issues, and repo-specific setup failures.
- [x] **BLKR-03**: Blocker reports include the next useful action instead of raw failure walls alone.

### Proof And Scope Honesty

- [x] **PROOF-01**: Pullstart is validated on one Node.js API + PostgreSQL proof repo before broader portability claims.
- [x] **PROOF-02**: Public docs and planning artifacts clearly separate the MVP contract and proof slice from future platform ideas.

## v2 Requirements

### Future Platform Possibilities

- **FUTR-01**: Generate onboarding contracts from repo evidence.
- **FUTR-02**: Learn recurring setup failures across repeated runs.
- **FUTR-03**: Expand to repo-family portability beyond the first proof repo type.
- **FUTR-04**: Add richer recovery and resume behavior after failed onboarding attempts.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Broad developer platform behavior | Not required to prove onboarding value and would blur the product wedge |
| Cross-repo memory product | Interesting later, but not part of the first user win |
| Plugin marketplace | Platform overhead before the core workflow is proven |
| Team dashboard/control plane | Adds surface area without improving clone-to-working flow |
| Broad autonomous coding agent behavior | Pullstart is an onboarding product first, not a general coding agent |
| Docs-first onboarding UX | Docs can support onboarding, but they are not the primary V1 control surface |
| Mandatory contract authoring by end users | V1 should benefit from contracts without demanding authorship upfront |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CNTR-01 | Phase 1 | Complete |
| CNTR-02 | Phase 1 | Complete |
| CNTR-03 | Phase 1 | Complete |
| PLAN-01 | Phase 2 | Complete |
| PLAN-02 | Phase 2 | Complete |
| PLAN-03 | Phase 2 | Complete |
| CAP-01 | Phase 3 | Complete |
| CAP-02 | Phase 3 | Complete |
| EXEC-01 | Phase 3 | Complete |
| EXEC-02 | Phase 3 | Complete |
| EXEC-03 | Phase 3 | Complete |
| EXEC-04 | Phase 3 | Complete |
| BLKR-01 | Phase 4 | Complete |
| BLKR-02 | Phase 4 | Complete |
| BLKR-03 | Phase 4 | Complete |
| PROOF-01 | Phase 5 | Complete |
| PROOF-02 | Phase 5 | Complete |

## Phase 5 proof framing

### Proven now

- PROOF-01 and PROOF-02 are complete based on one locked Node.js API + PostgreSQL proof target with traceable success and blocked evidence.

### Manual required

- Proof reproducibility still depends on user-controlled machine/process/service state at runtime.

### Deferred

- Portability guarantees beyond the single validated proof slice remain future-scope work.

### Unresolved ambiguities

- A pre-healthy verification target before managed startup remains an ambiguous state that must block rather than auto-pass.

**Coverage:**
- v1 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-23*
*Last updated: 2026-03-23 after V1 methodology consensus update*
