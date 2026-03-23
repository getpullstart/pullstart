# Roadmap: Pullstart

✅ **v1.0 MVP archived** — full phase history is in `.planning/milestones/v1.0-ROADMAP.md`.

## v1.1 Realignment Sequence (consensus-locked)

1. Authority and evidence contract
2. Deterministic evidence core
3. Capability verdict engine
4. Policy-gated planner with agent review
5. Policy-gated execution
6. Verification and blocker truth
7. One proof repo hardening

### Phase 1: Evidence-driven architecture and planning realignment

**Goal:** Realign product/requirements/roadmap/public framing to evidence-driven authority, policy-gated execution, explicit unknowns, and verification-first trust.
**Requirements**: [CNTR-REALIGN, EVD-REALIGN, CAP-REALIGN, POL-REALIGN, VER-REALIGN]
**Verdict model:** typed capability verdict generated before planning/execution (`ready`, `blocked`, `unknown`).
**Policy ownership:** policy gate owns execution permission (`auto-runnable`, `confirmation-required`, `manual-only`, `blocked`, `forbidden`).
**Depends on:** v1.0 archive complete
**Plans:** 3 plans

Plans:
- [x] 01-01-PLAN.md — Lock contract-authority and evidence-provenance framing across requirements/project surfaces
- [x] 01-02-PLAN.md — Realign capability verdict and policy-gate ownership language in roadmap/README surfaces
- [ ] 01-03-PLAN.md — Finalize verification-boundary criteria and phase roadmap bookkeeping for execution

### Next phases (queued, not planned)

- [ ] Phase 2: Deterministic evidence core hardening
- [ ] Phase 3: Capability verdict expansion and external-access blockers
- [ ] Phase 4: Policy gate formalization
- [ ] Phase 5: Policy-gated execution hardening
- [ ] Phase 6: Verification and blocker truth hardening
- [ ] Phase 7: One proof repo hardening (realignment-compliant rerun)
