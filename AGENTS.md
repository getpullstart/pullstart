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

## Sift-First Diagnosis

When working inside the Pullstart repo, use `sift` as the default first reduction layer for long, noisy, non-interactive shell output.

Use `sift` first when:

- output is long or messy
- the goal is to extract failures, risks, likely root causes, or the next debugging step
- exact raw output is not immediately required

Preferred shapes:

- `sift exec "question" -- <command> [args...]`
- a preset form when a matching preset exists for the command type

Do not use `sift` when:

- exact raw output is required
- the command is interactive or TUI-based
- the output is already short and clear
- shell control flow depends on exact raw output semantics

## Sift Incident Logging

If `sift` is insufficient, misleading, or clearly fails to answer the actual question:

1. Log the incident immediately in `.local/sift-incidents.md`
2. Continue the Pullstart task using raw output or direct source inspection
3. Do not debug, patch, or expand scope into fixing `sift` from within this repo

Each incident entry should capture:

- timestamp
- active task or user intent
- exact command run
- whether `sift` used a freeform question or preset
- the insufficient result or failure symptom
- a short suspicion about why it was insufficient
- whether raw output was used afterward
- the next manual debugging step

If a similar insufficiency happens again, add a new entry and briefly reference the earlier one.

The purpose of this log is to carry problems back to the `sift` repo later, not to investigate `sift` inside Pullstart.
