# Phase 1: Contract Model And MVP Slice - Research

**Researched:** 2026-03-23
**Domain:** MVP onboarding contract design for a Node.js API + PostgreSQL proof slice
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### MVP contract surface
- **D-01:** `setup.spec.yaml` is the only canonical onboarding contract surface in MVP.
- **D-02:** Supporting docs such as `README.md`, `ONBOARDING.md`, and `AGENTS.md` are explanatory, not source-of-truth inputs.

### Proof target
- **D-03:** The first proof repo type is a Node.js API service with PostgreSQL, `.env.example`, migrations, and a health check.
- **D-04:** MVP credibility depends on proving this one repo type before claiming broader portability.

### Scope discipline
- **D-05:** Phase 1 should tighten schema, proof scenario, and doc alignment only; it should not drift into building planner/executor code.
- **D-06:** Broader platform ideas may remain documented, but must stay clearly separated from the MVP slice.

### Claude's Discretion
- Exact schema field names inside the minimal `setup.spec.yaml` MVP, as long as they stay small and support the proof scenario.
- How to express the proof fixture and verification contract in docs or examples, as long as future implementation work becomes easier rather than broader.

### Deferred Ideas (OUT OF SCOPE)
- Planner implementation details — Phase 2
- Executor and verifier mechanics — Phase 3
- Blocker taxonomy implementation — Phase 4
- Real proof repo validation — Phase 5
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CNTR-01 | Pullstart uses `setup.spec.yaml` as the canonical onboarding contract surface for MVP. | Freeze one schema file, one example spec, and one schema validator path; keep other docs explanatory only. |
| CNTR-02 | The contract can declare required tools, services, env expectations, ordered setup steps, and verification checks. | Recommend the minimal section set and field rules needed for the proof repo only. |
| CNTR-03 | The contract remains reviewable by humans and reliable for agent parsing. | Recommend YAML + strict JSON Schema 2020-12 validation with descriptions/examples and no hidden control flow. |
</phase_requirements>

## Summary

Phase 1 should lock one narrow contract model, not a platform abstraction. The current repo framing already points to the right boundary: `setup.spec.yaml` is the only MVP source of truth, the only proof target is a Node.js API with PostgreSQL, and success means one trustworthy local boot path plus one health verification path. The work now is to convert that framing into a schema and documentation contract that makes Phase 2 smaller, not smarter.

The strongest implementation-ready shape is: author the contract in YAML for human review, validate it with a strict JSON Schema Draft 2020-12 schema, and keep the supported surface declarative. That means explicit arrays for tools, services, steps, and checks; stable step IDs; a small set of verification types; and no embedded branching language. The planner can later decide whether the success path is reachable, but the contract should only declare the intended path, prerequisites, and acceptable fallbacks.

The current example spec is close, but still too loose for a stable MVP boundary. Phase 1 should sharpen it into one minimal schema, one proof fixture example, and one doc alignment pass that consistently says: supporting docs explain, the contract declares, and Pullstart only promises one credible onboarding slice.

**Primary recommendation:** Use `setup.spec.yaml` authored in YAML and validated by strict JSON Schema 2020-12; support only the fields required for the Node.js API + PostgreSQL proof path, and treat everything else as deferred.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `yaml` | 2.8.3 | Parse and rewrite `setup.spec.yaml` while preserving human-friendly structure | Official docs support YAML 1.1/1.2 plus `parseDocument()` and comment-aware document APIs, which fits reviewable config better than a bare parser. |
| `ajv` | 8.18.0 | Validate the parsed contract against JSON Schema | Official docs support strict mode, `validateSchema()`, and modern JSON Schema drafts; this is the safest path for reliable agent parsing. |
| JSON Schema Draft 2020-12 | 2022-06-16 spec | Canonical schema language for the contract | Current standard draft with stable annotation keywords and strong validator support. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `ajv-formats` | 3.0.1 | Validate URI-like fields such as HTTP verification targets | Use only if the schema adds URL/hostname formats for `verify` targets. |
| `vitest` | 4.1.0 | Fast contract/schema fixture tests | Use when Phase 2 starts implementation; none of this infrastructure exists yet in the repo. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `ajv` + JSON Schema | `zod` 4.3.6 | Zod is excellent for authoring TS-first schemas, but the MVP contract is a repo-authored YAML artifact that benefits more from JSON Schema as the reviewable, tool-neutral contract language. |
| `yaml` | `js-yaml` | `js-yaml` is simpler, but `yaml` has stronger document-level APIs for preserving comments and round-tripping human-edited files. |

**Installation:**
```bash
npm install yaml ajv ajv-formats
npm install -D vitest
```

**Version verification:**
- `yaml` `2.8.3` — verified with `npm view yaml version time --json`; published 2026-03-21.
- `ajv` `8.18.0` — verified with `npm view ajv version time --json`; published 2026-02-14.
- `ajv-formats` `3.0.1` — verified with `npm view ajv-formats version time --json`; published 2024-03-30.
- `vitest` `4.1.0` — verified with `npm view vitest version time --json`; published 2026-03-12.

## Architecture Patterns

### Recommended Project Structure
```text
contracts/
├── setup.spec.example.yaml      # Canonical proof-repo example
└── setup.spec.schema.json       # Strict JSON Schema for MVP contract

docs/
├── onboarding-contract.md       # Explains contract rules and boundaries
├── mvp-proof-scenario.md        # Defines the proof fixture and win condition
└── mvp-architecture.md          # Keeps later phases aligned to this contract

examples/
└── proof-node-api/              # Optional: fixture notes only, not a generic examples gallery

src/
└── contracts/                   # Phase 2+: parser/validator code only after schema is frozen

test/
└── contracts/                   # Phase 2+: schema fixture tests and negative cases
```

### Pattern 1: Declarative Contract, Not Workflow DSL
**What:** Keep the spec to declared prerequisites, ordered actions, and one success path. No condition language, loops, retries, or planner logic inside the YAML.
**When to use:** Always in MVP.
**Example:**
```yaml
version: 0

repo:
  name: sample-node-api
  description: Node API onboarding contract for local development

tools:
  - name: node
    version: "20.x"
    required: true
  - name: pnpm
    version: "9.x"
    required: true

services:
  - name: postgres
    requirement: one_of
    options:
      - type: docker
        start: docker compose up -d postgres
      - type: external
        health:
          type: tcp
          target: localhost:5432

env:
  file: .env
  example: .env.example

steps:
  - id: install
    run: pnpm install
  - id: migrate
    run: pnpm db:migrate
  - id: start
    run: pnpm dev

verify:
  - id: health
    type: http
    target: http://localhost:3000/health
    expect_status: 200
```

### Pattern 2: Annotated Schema For Human Review
**What:** Put `title`, `description`, and examples in the JSON Schema, not in scattered docs. The schema becomes self-documenting without becoming the source of execution logic.
**When to use:** For every top-level section and any field where reviewers may ask “what belongs here?”
**Example:**
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "title": "Pullstart setup contract",
  "description": "Minimal onboarding contract for the MVP proof repo.",
  "required": ["version", "repo", "tools", "steps", "verify"],
  "additionalProperties": false,
  "properties": {
    "version": {
      "type": "integer",
      "const": 0,
      "description": "MVP contract version."
    }
  }
}
```

### Pattern 3: Verification Declares The Success Boundary
**What:** The contract should declare the single proof-worthy success check, not a full QA suite.
**When to use:** For Phase 1 and the first proof repo.
**Example:**
```yaml
verify:
  - id: health
    type: http
    target: http://localhost:3000/health
    expect_status: 200
    description: Confirms the app booted far enough for local development.
```

### Anti-Patterns to Avoid
- **Contract as planner:** Do not encode “if Docker is missing then try X else Y.” Declare valid options; let later planner logic choose.
- **Schema as giant framework:** Do not add stack-generic abstractions before the Node/Postgres proof repo forces them.
- **Hidden required behavior in notes:** If something is required for success, it belongs in `tools`, `services`, `env`, `steps`, or `verify`, not only in prose.
- **Mutable validation:** Do not use Ajv features like `removeAdditional` for the MVP contract path; reject invalid specs instead of silently rewriting them.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YAML parsing | Custom line parser or regex extraction | `yaml` `parseDocument()` | Human-edited config needs real YAML parsing and document-level error handling. |
| Contract validation | Ad hoc `if` checks over JS objects | JSON Schema 2020-12 + `ajv` strict validation | Prevents ambiguous fields, missing sections, and silent drift. |
| URL/HTTP target validation | Homegrown regexes | `ajv-formats` or explicit schema patterns | Format validation looks simple until edge cases show up. |
| Contract examples as truth | Multiple prose examples that drift | One schema plus one canonical example spec | Reduces doc drift and review confusion. |

**Key insight:** The MVP contract should be boring to parse. Complexity belongs in later planner decisions, not in the authoring surface.

## Common Pitfalls

### Pitfall 1: Over-Specifying Future Portability
**What goes wrong:** The schema grows fields for Python repos, monorepos, kubernetes, resume state, or recovery modes before the first proof repo exists.
**Why it happens:** Teams confuse “future possibility” with “current contract requirement.”
**How to avoid:** Every field must justify itself against the Node.js API + PostgreSQL proof path.
**Warning signs:** New fields have no use in the proof example or only exist to support hypothetical repo families.

### Pitfall 2: Mixing Fallback Notes With Executable Truth
**What goes wrong:** Required behavior ends up buried in `fallback_notes` or prose comments.
**Why it happens:** It feels easier than modeling the path explicitly.
**How to avoid:** Reserve notes for human context only; required options belong in typed fields such as `services.options`.
**Warning signs:** A reviewer cannot tell from structured fields alone whether setup is actually reachable.

### Pitfall 3: Verification That Is Too Shallow
**What goes wrong:** “Install completed” is treated as success even though the app still cannot boot.
**Why it happens:** Install is easier to test than runnable state.
**How to avoid:** Keep one app-level verification path in the contract, such as HTTP `/health` after migrations and service reachability.
**Warning signs:** A contract passes validation without proving the repo is usable for development.

### Pitfall 4: Silent Schema Leniency
**What goes wrong:** Extra fields, duplicate keys, or malformed URLs are quietly accepted.
**Why it happens:** Parsers and validators are run in permissive defaults.
**How to avoid:** Use YAML parsing options that surface warnings and Ajv strict validation with `additionalProperties: false` on all object shapes.
**Warning signs:** Two similar field names appear in examples, or reviewers cannot tell which one is canonical.

## Code Examples

Verified patterns from official sources:

### Parse A Human-Edited YAML Document
```typescript
import { parseDocument } from 'yaml'

const doc = parseDocument(source, {
  prettyErrors: true,
  strict: true,
  uniqueKeys: true
})

if (doc.errors.length) throw doc.errors[0]
const data = doc.toJS()
```
Source: https://eemeli.org/yaml/

### Validate The Parsed Contract With Ajv
```typescript
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const ajv = new Ajv({
  strict: true,
  allErrors: true,
  validateSchema: true
})
addFormats(ajv)

const validate = ajv.compile(schema)
if (!validate(contract)) {
  throw new Error(ajv.errorsText(validate.errors))
}
```
Source: https://ajv.js.org/api.html

### Use Schema Annotations To Keep The Contract Reviewable
```json
{
  "title": "Setup steps",
  "description": "Ordered actions required to reach the MVP success path.",
  "examples": [
    [
      { "id": "install", "run": "pnpm install" }
    ]
  ]
}
```
Source: https://json-schema.org/understanding-json-schema/reference/annotations

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| README-only onboarding | Structured contract plus supporting docs | MVP product choice, 2026-03 | Makes setup intent machine-checkable and reviewable. |
| Loose schema drafts / ad hoc validators | JSON Schema Draft 2020-12 | Published 2022-06-16 | Gives stable validation vocabulary and modern validator support. |
| “Install succeeded” as setup proof | One declared runnable-enough verification path | Current MVP framing | Keeps success honest and user-trustworthy. |

**Deprecated/outdated:**
- Markdown as primary onboarding contract: useful as explanation, unreliable as executable truth.
- Giant abstraction-first schemas: premature before proof on one repo type.

## Open Questions

1. **How should service alternatives be represented in the MVP schema?**
   - What we know: The example already hints at Docker versus an already-running Postgres instance.
   - What's unclear: Whether this should be a typed `options` list under `services` or remain a note for Phase 1.
   - Recommendation: Model it structurally only if the proof repo truly supports both paths; otherwise keep one required path and one explanatory note.

2. **Should `env` model required keys now or only file derivation?**
   - What we know: CNTR-02 requires env expectations, and the proof repo includes `.env.example`.
   - What's unclear: Whether key-level env completeness checking is needed before Phase 2.
   - Recommendation: In Phase 1, require `file` plus `example`; defer per-key validation unless the proof repo cannot be planned safely without it.

3. **Should step dependencies be explicit in the schema?**
   - What we know: The proof path is linear: install, service ready, migrate, app start, verify.
   - What's unclear: Whether ordering alone is enough for Phase 2 planner implementation.
   - Recommendation: Use ordered arrays only in MVP; add dependency metadata later only if a real repo breaks that assumption.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `vitest` 4.1.0 recommended, not installed |
| Config file | none — see Wave 0 |
| Quick run command | `pnpm vitest run test/contracts/setup-spec-schema.test.ts` |
| Full suite command | `pnpm vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CNTR-01 | Only `setup.spec.yaml` is treated as canonical MVP contract input | unit | `pnpm vitest run test/contracts/setup-spec-schema.test.ts -t CNTR-01` | ❌ Wave 0 |
| CNTR-02 | Schema accepts tools, services, env, ordered steps, and verification checks for the proof repo | unit | `pnpm vitest run test/contracts/setup-spec-fixtures.test.ts -t CNTR-02` | ❌ Wave 0 |
| CNTR-03 | Invalid or ambiguous contract shapes are rejected while valid fixtures stay readable | unit | `pnpm vitest run test/contracts/setup-spec-negative.test.ts -t CNTR-03` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm vitest run test/contracts/*.test.ts`
- **Per wave merge:** `pnpm vitest run`
- **Phase gate:** Contract schema fixtures and negative cases green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `package.json` and Node workspace bootstrap — required before any automated validation runs.
- [ ] `vitest.config.ts` — no JS/TS test harness exists in the repo yet.
- [ ] `contracts/setup.spec.schema.json` — schema file does not exist yet.
- [ ] `test/contracts/setup-spec-schema.test.ts` — canonicality and required-section coverage.
- [ ] `test/contracts/setup-spec-fixtures.test.ts` — positive proof-repo fixture coverage for CNTR-02.
- [ ] `test/contracts/setup-spec-negative.test.ts` — duplicate keys, extra fields, and malformed verification targets.

## Sources

### Primary (HIGH confidence)
- Local repo sources:
  - `AGENTS.md`
  - `.planning/PROJECT.md`
  - `.planning/REQUIREMENTS.md`
  - `.planning/ROADMAP.md`
  - `.planning/phases/01-contract-model-and-mvp-slice/01-CONTEXT.md`
  - `contracts/setup.spec.example.yaml`
  - `contracts/contract-principles.md`
  - `docs/onboarding-contract.md`
  - `docs/mvp-proof-scenario.md`
  - `docs/mvp-architecture.md`
- Context7 `/ajv-validator/ajv` — strict mode, validation patterns, `additionalProperties`, draft support.
- Context7 `/eemeli/yaml` — YAML 1.2 support, `parseDocument()`, comment-preserving document APIs, parser options.
- JSON Schema official docs: https://json-schema.org/draft/2020-12
- JSON Schema annotations guide: https://json-schema.org/understanding-json-schema/reference/annotations
- Ajv official API docs: https://ajv.js.org/api.html
- YAML official docs: https://eemeli.org/yaml/
- npm registry metadata via:
  - `npm view yaml version time --json`
  - `npm view ajv version time --json`
  - `npm view ajv-formats version time --json`
  - `npm view vitest version time --json`

### Secondary (MEDIUM confidence)
- Context7 `/websites/zod_dev_v4` — used only for alternative comparison, not as primary recommendation.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Current package versions verified from npm and behavior checked against official docs/Context7.
- Architecture: HIGH - Strongly anchored to repo-local MVP decisions and corroborated by validator/parser docs.
- Pitfalls: MEDIUM - Based on official validator/parser behavior plus inference from the current product boundary.

**Research date:** 2026-03-23
**Valid until:** 2026-04-22
