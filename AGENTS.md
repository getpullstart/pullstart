# Pullstart Agent Notes

## Execution Source of Truth

For product execution, use the GSD planning artifacts under `.planning/` as the canonical workflow surface.

That means:

- read `.planning/STATE.md` first for current position
- treat `.planning/PROJECT.md` as the living project brief
- treat `.planning/ROADMAP.md` as the executable phase order
- treat `.planning/REQUIREMENTS.md` as the checkable definition of done
- use `.planning/phases/` for phase context, plans, summaries, and verification artifacts

The root-level docs remain important public-facing product documents. They explain the product well, but they are not the operational execution state.

## Pullstart Scope Guardrail

Keep Pullstart narrow:

- onboarding and setup first
- contract-driven
- repo-aware
- verification-aware

Do not broaden it into:

- a generic agent OS
- a memory platform
- a workflow operating system
- a plugin platform
- a broad developer control plane

## Current Product Contract

The MVP canonical onboarding contract surface is `setup.spec.yaml`.

Supporting files like `README.md`, `AGENTS.md`, and `ONBOARDING.md` are secondary or explanatory in MVP.
