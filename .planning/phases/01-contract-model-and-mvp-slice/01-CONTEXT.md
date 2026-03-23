# Phase 1: Contract Model And MVP Slice - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase does not build the runtime planner yet. It tightens the MVP contract and proof boundary so implementation can start from a small, stable surface instead of vague product framing.

</domain>

<decisions>
## Implementation Decisions

### MVP contract surface
- **D-01:** `setup.spec.yaml` is the only canonical onboarding contract surface in MVP.
- **D-02:** Supporting docs such as `README.md`, `ONBOARDING.md`, and `AGENTS.md` are explanatory, not source-of-truth inputs.

### Proof target
- **D-03:** The first proof repo type is a Node.js API service with PostgreSQL, `.env.example`, migrations, and a health check.
- **D-04:** MVP credibility depends on proving this one repo type before claiming broader portability.

### Scope discipline
- **D-05:** Phase 1 should tighten schema, proof scenario, and doc alignment only; it should not drift into building planner/executor code.
- **D-06:** Broader platform ideas may remain documented, but must stay clearly separated from the MVP slice.

### the agent's Discretion
- Exact schema field names inside the minimal `setup.spec.yaml` MVP, as long as they stay small and support the proof scenario.
- How to express the proof fixture and verification contract in docs or examples, as long as future implementation work becomes easier rather than broader.

</decisions>

<specifics>
## Specific Ideas

- The repo already has strong framing in root docs; Phase 1 should leverage that rather than rewrite it.
- The most valuable output of this phase is a small schema and a sharper implementation boundary, not more visionary writing.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product framing
- `README.md` — public product statement and wedge
- `PROJECT.md` — MVP thesis, falsification check, contract choice, and proof scenario

### Supporting product docs
- `REQUIREMENTS.md` — public requirement framing and constraints
- `docs/onboarding-contract.md` — contract rationale and supporting-surface boundaries
- `docs/mvp-proof-scenario.md` — proof repo shape and win condition
- `docs/mvp-architecture.md` — conceptual architecture layers for MVP

### Execution docs
- `.planning/PROJECT.md` — current project brief and scope boundaries
- `.planning/REQUIREMENTS.md` — requirement IDs and traceability
- `.planning/ROADMAP.md` — executable phase order and Phase 1 goal

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `contracts/setup.spec.example.yaml`: early contract example that can be refined into the MVP schema.
- Root docs: already contain the product story, non-goals, and proof framing.

### Established Patterns
- Docs-first repository shape with `contracts/`, `docs/`, `examples/`, `src/`, and `test/`.
- Public-facing docs exist at repo root; planning state now lives under `.planning/`.

### Integration Points
- Phase 1 outputs should feed directly into Phase 2 planner implementation.
- Any contract changes should stay consistent across the public docs, example contract, and planning docs.

</code_context>

<deferred>
## Deferred Ideas

- Planner implementation details — Phase 2
- Executor and verifier mechanics — Phase 3
- Blocker taxonomy implementation — Phase 4
- Real proof repo validation — Phase 5

</deferred>

---

*Phase: 01-contract-model-and-mvp-slice*
*Context gathered: 2026-03-23*
