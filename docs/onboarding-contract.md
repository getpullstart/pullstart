# Onboarding Contract

## Canonical surface

`setup.spec.yaml` is the only canonical onboarding contract surface in Pullstart MVP.

The validation contract for that file lives in `contracts/setup.spec.schema.json`, which defines the strict JSON Schema shape Phase 2 is allowed to parse.

## Supported MVP sections

Phase 1 supports one deliberately small section set:

- `version`
- `repo`
- `tools`
- `services`
- `env`
- `steps`
- `verify`

These sections are enough to describe the first proof scenario: a Node.js API repo with PostgreSQL, `.env.example`, ordered bootstrap steps, and one health verification path.

## Why the contract stays narrow

The MVP contract is meant to be reviewable by humans and reliable for strict parsing. That means the spec declares setup intent in a small declarative shape instead of spreading required behavior across prose or hidden fallback notes.

If a detail is required to get the repo running, it belongs in one of the supported sections above. Supporting docs can explain context, but they do not redefine the contract.

## What supporting docs still do

Files like `README.md`, `ONBOARDING.md`, and `AGENTS.md` still matter. They give background, troubleshooting context, and product framing that help developers understand the repo.

In MVP they are secondary sources, not ignored sources. Pullstart can use them as explanation, but `setup.spec.yaml` remains the authoritative declaration of onboarding intent.

## Explicit Phase 1 exclusions

Phase 1 does not broaden the contract into a workflow language or portability promise. The current boundary intentionally excludes:

- planner logic or branching rules
- executor mechanics and runtime control flow
- blocker taxonomy or recovery systems
- broad portability claims beyond the first Node.js plus PostgreSQL proof slice

Keeping these out of the contract makes the next implementation phases smaller and easier to verify.
