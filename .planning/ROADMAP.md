# Roadmap: Pullstart

✅ **v1.0 MVP archived** — full phase history is in `.planning/milestones/v1.0-ROADMAP.md`.

## v1.1 Realignment Sequence (consensus-locked)

### Phase 01: Evidence-driven architecture and planning realignment

**Goal:** Realign product/requirements/roadmap/public framing to evidence-driven authority, policy-gated execution, explicit unknowns, and verification-first trust.
**Requirements**: [CNTR-REALIGN, EVD-REALIGN, CAP-REALIGN, POL-REALIGN, VER-REALIGN]
**Verdict model:** typed capability verdict generated before planning/execution (`ready`, `blocked`, `unknown`).
**Policy ownership:** policy gate owns execution permission (`auto-runnable`, `confirmation-required`, `manual-only`, `blocked`, `forbidden`).
**Depends on:** v1.0 archive complete
**Plans:** 3 plans

Plans:
- [x] 01-01-PLAN.md — Lock contract-authority and evidence-provenance framing across requirements/project surfaces
- [x] 01-02-PLAN.md — Realign capability verdict and policy-gate ownership language in roadmap/README surfaces
- [x] 01-03-PLAN.md — Finalize verification-boundary criteria and phase roadmap bookkeeping for execution

### Phase 02: Deterministic evidence core hardening

**Goal:** Harden canonical fact normalization so declared, observed-repo, observed-machine, runtime-observed, and inferred evidence retain provenance and contradiction truth through the full pipeline.
**Requirements**: [EVD-01, EVD-02, EVD-03, EVD-04, UNKN-01, UNKN-02, UNKN-03]
**Depends on:** Phase 01
**Plans:** 2/3 plans executed

Plans:
- [ ] 02-01-PLAN.md — Establish canonical evidence contracts and typed inspector provenance outputs
- [x] 02-02-PLAN.md — Thread provenance, contradiction truth, and unknown lifecycle through planner/verdict surfaces
- [x] 02-03-PLAN.md — Preserve runtime-observed evidence continuity through execution and CLI outputs

### Phase 03: Capability verdict expansion and external-access blockers

**Goal:** Expand typed capability verdict coverage so machine, repo, and external-access blockers produce deterministic proceed/ask/block/unknown eligibility before planning and execution.
**Requirements**: [CAP-01, CAP-02, CAP-03, ENT-01, ENT-02, ENT-03, ENT-04, ENT-05]
**Depends on:** Phase 02
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 3 to break down)

### Phase 04: Policy gate formalization

**Goal:** Formalize policy classification and execution permission ownership so every step is explicitly classified and cannot be self-authorized by planner, agent, or contract alone.
**Requirements**: [POL-01, POL-02, POL-03, PLAN-01, PLAN-02, PLAN-03]
**Depends on:** Phase 03
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 4 to break down)

### Phase 05: Policy-gated execution hardening

**Goal:** Harden bounded execution so only policy-eligible steps run, runtime-observed truth is captured per boundary, and reconciliation enforces conservative stop behavior.
**Requirements**: [EXEC-01, EXEC-02, EXEC-03, EXEC-04]
**Depends on:** Phase 04
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 5 to break down)

### Phase 06: Verification and blocker truth hardening

**Goal:** Make verification the explicit trust boundary and blocker output deterministic, provenance-backed, and unknown-preserving.
**Requirements**: [VER-01, VER-02, VER-03, VER-04, BLKR-01, BLKR-02, BLKR-03]
**Depends on:** Phase 05
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 6 to break down)

### Phase 07: One proof repo hardening

**Goal:** Re-run and harden one locked proof repo under the realigned authority/evidence/policy/verification model with explicit proven/manual/deferred/unresolved boundaries.
**Requirements**: [PROOF-01, PROOF-02]
**Depends on:** Phase 06
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 7 to break down)

### Phase 999.2: Post-phase UX polish and CLI-first rerun behavior (BACKLOG)

**Goal:** Improve onboarding UX with richer install summaries, detailed colored logging, optional user preference tracking, and CLI-first `up` semantics with safe skip/rerun behavior.
**Requirements**: TBD
**Depends on:** Phase 07
**Plans:** 0 plans

Plans:
- [ ] TBD (promote and plan when core realignment phases are complete)
