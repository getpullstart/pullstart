# Onboarding Contract

## Canonical surface

Pullstart MVP uses `setup.spec.yaml` as the canonical onboarding contract surface.

## Why not markdown alone

Markdown onboarding docs are helpful, but they break down as the primary agent contract because they are:

- inconsistent across repos
- hard to parse reliably
- easy to let drift from actual setup behavior

Pullstart still reads human docs as supporting evidence, but it centers setup intent in one structured contract.

## What `setup.spec.yaml` should express

The first schema should stay small. It only needs to cover the MVP proof scenario well.

Core sections:

- repo metadata
- tool prerequisites
- services
- environment expectations
- ordered setup steps
- verification
- fallback notes

## Supporting files

These files may exist, but they are secondary in MVP:

- `README.md`
- `ONBOARDING.md`
- `AGENTS.md`
- repo-specific runbooks

They explain, contextualize, or elaborate. They do not replace `setup.spec.yaml` as source of truth.
