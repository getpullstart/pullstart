# Pullstart

## What This Is

Pullstart V1 is a repo-aware onboarding engine for developers who need to get a cloned repository to one verified runnable state without decoding scattered setup lore. It reads an onboarding contract if present, inspects repo and machine reality, produces a capability verdict, executes or guides the shortest safe bootstrap path, and verifies one explicit runnable success signal.

It is not a broad platform, a generic repo analysis product, or a memory product. The working V1 target is intentionally narrow and explicitly revisable with evidence.

## Working Methodology

Pullstart V1 follows this methodology:

1. Read the onboarding contract if present.
2. Inspect repo and machine reality.
3. Produce a capability verdict.
4. Execute or guide the shortest safe bootstrap path.
5. Verify one clear runnable success signal.

This is not pure contract-first, pure discovery-first, or docs-first. Discovery can assist, but it cannot silently become the truth owner.

## Core Value

Get a real repo from clone to working local setup faster and with fewer dead ends than the repo's existing onboarding path.

## Requirements

### Validated

- ✓ Pullstart now has a machine-readable onboarding contract concept, with `setup.spec.yaml` as the current candidate artifact rather than sacred doctrine — validated in Phase 1.
- ✓ The first proof boundary is one Node.js API + PostgreSQL setup slice with aligned public and planning docs — validated in Phase 1.
- ✓ Pullstart can load the frozen contract, inspect repo and machine state, and emit a blocker-first bootstrap plan without executing setup commands — validated in Phase 2.
- ✓ Pullstart can produce explicit capability verdicts and run bounded execution with managed verification and trustworthy blocked outcomes — validated in Phase 3.
- ✓ Pullstart classifies common setup failures into stable, actionable blocker categories across planner and runtime output — validated in Phase 4.
- ✓ Pullstart has been validated on one locked proof repo target with both success and blocked evidence, and docs now separate proven/manual/deferred boundaries — validated in Phase 5.

### Active

- [ ] Complete milestone closeout and archive planning artifacts for v1.0.
- [ ] Prioritize and promote selected backlog items for next milestone scope.

### Out of Scope

- Broad platform behavior — too broad and weakens the onboarding wedge.
- Cross-repo memory or consensus systems — interesting later, but not necessary to prove clone-to-working value.
- Plugin platforms, dashboards, or workflow control planes — premature platform surface before the first repo proof.
- Broad "works for any repo" positioning — misleading before proof on one real repo family.
- Docs-first onboarding experience — V1 should use docs as support, not as the primary control surface.
- User-facing contract authoring burden — V1 should benefit from contracts without demanding that every user write one upfront.

## Context

- The project started with strong public-facing framing in the root docs, but not with the actual GSD planning layer.
- Pullstart's MVP wedge is intentionally narrow: "Clone a repo. Let the agent get it running."
- The onboarding contract concept is locked for V1, but the exact filename is still provisional. `setup.spec.yaml` remains the current candidate.
- The first proof scenario is a Node.js API repository with PostgreSQL, `.env.example`, migrations, and a health check.
- Phase 1 now also defines a proof-repo checklist and a strict schema-backed contract boundary that Phase 2 must consume rather than reinterpret.
- Root docs such as `README.md`, `PROJECT.md`, `ROADMAP.md`, and `REQUIREMENTS.md` are sound and should remain the public product explanation.
- `.planning/` is now the execution source of truth so future work can move phase-by-phase instead of relying on fresh bootstrap prompts.
- Temporary moon model: Pullstart is the calm, opinionated staff engineer for the first 30 minutes in a new codebase. This is a revisable target, not a permanent promise.

## Constraints

- **Scope**: MVP must stay onboarding-first — broad platform ideas are deferred until after proof on one real repo type.
- **Contract**: the onboarding contract concept is fixed, but the filename and final artifact shape may still evolve with evidence.
- **Discovery**: discovery may fill gaps, but it cannot become the silent source of truth.
- **Capability**: auth, network, and permission reality must be modeled honestly; V1 should not fake certainty or childish abstractions.
- **Execution**: The next work should proceed through GSD phases, plans, summaries, and verification artifacts.
- **Proof**: Success is measured on one credible proof repo before portability claims expand.
- **Phase boundary**: Phase 1 delivers contract and proof readiness, not planner or executor code.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Lock the onboarding contract concept now, but keep the exact filename provisional | V1 needs machine-readable intent, but the artifact name should remain evidence-driven | ✓ Good |
| Use `setup.spec.yaml` as the current contract candidate | It is good enough to validate the concept while keeping the filename revisable | ✓ Good |
| Treat root docs as product-facing and `.planning/` as execution-facing | Preserves good framing while giving future work a real GSD operating surface | ✓ Good |
| Start with one Node.js API + Postgres proof repo | Narrow proof target keeps the MVP honest and testable | ✓ Good |
| Freeze Phase 1 at contract plus proof readiness, not runtime implementation | Keeps planner work in Phase 2 from broadening or redefining the MVP boundary | ✓ Good |
| Keep `.planning/` local-only | Planning remains the execution surface, but local-only tracking keeps product git history focused on shipped repo changes | ✓ Good |
| Model capability verdict explicitly before execution | Auth, network, toolchain, and permission truth should gate action instead of hiding uncertainty | ✓ Good |
| Require one locked proof repo commit with both success and blocked evidence before Phase 5 closeout | Prevents portability theater and keeps claims evidence-traceable | ✓ Good |
| Treat pre-healthy verification targets as blocked ambiguity instead of success | Avoids false-positive proof claims when startup ownership is unclear | ✓ Good |

## Phase 5 proof evidence framing

### Proven now

- One locked proof target (`file:///tmp/pullstart-phase5-proof-repo` @ `4c87ba3f944c838f26ae152823fc254804d6bc9b`) produced both success and blocked run outcomes.
- Managed verification success and blocked ambiguity behavior are both evidence-backed in Phase 5 artifacts.
- Scope remains one Node.js API + PostgreSQL proof slice only.

### Manual required

- Users must keep machine/service/process state attributable (especially clearing pre-existing health target processes).
- Real auth/network/install conditions remain runtime-resolved, not pre-execution certainties.

### Deferred

- Any multi-repo compatibility claim or portability expansion.
- Platform surfaces (plugins/control planes/memory products) beyond onboarding MVP.

### Unresolved ambiguities

- Verification ownership is ambiguous when a health endpoint is already healthy before managed `start-app`.
- Pre-execution registry auth/network checks remain unknown until runtime commands execute.

---
*Last updated: 2026-03-23 after Phase 5 proof validation update*
