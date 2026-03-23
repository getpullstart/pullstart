# Pullstart

## What This Is

Pullstart is a repo-aware onboarding agent for developers who need to get a cloned repository running locally without decoding scattered setup lore. It reads a declared setup contract, checks machine and repo state, plans the shortest safe bootstrap path, executes or guides the key setup steps, and verifies whether the repo is actually runnable enough to continue.

## Core Value

Get a real repo from clone to working local setup faster and with fewer dead ends than the repo's existing onboarding path.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Prove that one canonical contract surface can drive a trustworthy onboarding flow for one real repo type.
- [ ] Deliver a narrow MVP that plans, executes or guides setup, verifies one success path, and reports blockers clearly.
- [ ] Keep future platform ideas documented but structurally separated from the MVP.

### Out of Scope

- Generic agent OS behavior — too broad and weakens the onboarding wedge.
- Cross-repo memory or consensus systems — interesting later, but not necessary to prove clone-to-working value.
- Plugin platforms, dashboards, or workflow control planes — premature platform surface before the first repo proof.
- Broad "works for any repo" positioning — misleading before proof on one real repo family.

## Context

- The project started with strong public-facing framing in the root docs, but not with the actual GSD planning layer.
- Pullstart's MVP wedge is intentionally narrow: "Clone a repo. Let the agent get it running."
- The canonical onboarding contract surface for MVP is `setup.spec.yaml`.
- The first proof scenario is a Node.js API repository with PostgreSQL, `.env.example`, migrations, and a health check.
- Root docs such as `README.md`, `PROJECT.md`, `ROADMAP.md`, and `REQUIREMENTS.md` are sound and should remain the public product explanation.
- `.planning/` is now the execution source of truth so future work can move phase-by-phase instead of relying on fresh bootstrap prompts.

## Constraints

- **Scope**: MVP must stay onboarding-first — broad platform ideas are deferred until after proof on one real repo type.
- **Contract**: `setup.spec.yaml` is the canonical onboarding contract — supporting docs do not replace it.
- **Execution**: The next work should proceed through GSD phases, plans, summaries, and verification artifacts.
- **Proof**: Success is measured on one credible proof repo before portability claims expand.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use `setup.spec.yaml` as the MVP contract surface | Structured, reviewable, and better suited than markdown-only onboarding for agent execution | — Pending |
| Treat root docs as product-facing and `.planning/` as execution-facing | Preserves good framing while giving future work a real GSD operating surface | ✓ Good |
| Start with one Node.js API + Postgres proof repo | Narrow proof target keeps the MVP honest and testable | — Pending |
| Keep planning tracked in git | This repo is greenfield product work, so planning history is part of the project record | ✓ Good |

---
*Last updated: 2026-03-23 after GSD bootstrap conversion*
