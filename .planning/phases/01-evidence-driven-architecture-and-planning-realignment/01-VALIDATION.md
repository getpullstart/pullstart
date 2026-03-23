---
phase: 01
slug: evidence-driven-architecture-and-planning-realignment
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-23
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for framing/requirements realignment work.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.0 |
| **Config file** | none — uses `package.json` scripts |
| **Quick run command** | `pnpm test -- test/contract/load-setup-spec.test.ts` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~1 second |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- test/contract/load-setup-spec.test.ts`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | CNTR-REALIGN | manual consistency | `pnpm test` (regression guard) | ✅ | ⬜ pending |
| 01-01-02 | 01 | 1 | EVD-REALIGN | manual consistency | `pnpm test` (regression guard) | ✅ | ⬜ pending |
| 01-02-01 | 02 | 2 | CAP-REALIGN | manual consistency | `pnpm test` (regression guard) | ✅ | ⬜ pending |
| 01-02-02 | 02 | 2 | POL-REALIGN | manual consistency | `pnpm test` (regression guard) | ✅ | ⬜ pending |
| 01-03-01 | 03 | 3 | VER-REALIGN | manual consistency | `pnpm test` (regression guard) | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Existing test infrastructure covers this docs/planning phase.
- [x] No framework install required.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Authority boundaries are explicit and consistent across root + `.planning` docs | CNTR-REALIGN | Semantic framing check across docs | Verify deterministic evidence/policy/verification/agent boundaries are explicitly and consistently stated in `PROJECT.md`, `README.md`, `.planning/PROJECT.md`. |
| Provenance, unknown, and blocked outcomes remain first-class | EVD-REALIGN | Narrative quality + consistency | Verify terms `declared`, `observed-repo`, `observed-machine`, `runtime-observed`, `inferred`, `unknown`, and `blocked` are represented without collapse. |
| Capability verdict precedes planning/execution and remains structured-first | CAP-REALIGN | Cross-doc logic check | Verify capability verdict language in `REQUIREMENTS.md` and roadmap phase framing remains typed-first and pre-execution. |
| Policy gate is explicit execution-permission owner | POL-REALIGN | Ownership boundary check | Verify policy classifications and authority statements in requirements/roadmap/project docs. |
| Verification remains trust boundary and rejects fake success | VER-REALIGN | Proof semantics check | Verify verification states include healthy / healthy-but-ownership-unknown / failed / not-provable and that “commands ran” is not treated as proof. |

---

## Artifact Check Rows

| Artifact | Requirement | Check |
|----------|-------------|-------|
| `README.md` | VER-REALIGN | Contains verification-first trust boundary wording and explicit blocker/unknown outcomes. |
| `PROJECT.md` | VER-REALIGN | States verification owns runnable-enough proof and rejects command-completion as proof. |
| `.planning/ROADMAP.md` | VER-REALIGN | Phase 1 plan inventory references `01-01-PLAN.md`, `01-02-PLAN.md`, `01-03-PLAN.md`. |

---

## Validation Sign-Off

- [x] All tasks have verification expectations
- [x] Sampling continuity is defined
- [x] Wave 0 requirements are complete
- [x] No watch-mode flags
- [x] Feedback latency < 10 seconds
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
