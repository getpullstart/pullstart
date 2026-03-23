# Pullstart

Pullstart helps developers get a cloned repo into one verified runnable state with less guessing.

Version 1 stays focused on onboarding. It starts from declared setup intent when available, inspects repo and machine evidence, builds typed capability truth (including blocked/unknown), reviews the safest path with agent assistance, runs only policy-allowed steps, and verifies one explicit readiness target.

## Who it is for

Pullstart is for developers who:

- just cloned a repo
- want to get it running locally
- do not want to piece setup together from old docs, failed commands, and team lore

The first proof target is a Node.js API repo with PostgreSQL, env setup, migrations, and one health check.

## How it works

Pullstart V1 follows a bounded evidence-first flow:

1. Read declared setup intent when available.
2. Inspect repo and machine evidence.
3. Build a typed capability result, including blocked or unknown states.
4. Review the safest path with bounded agent assistance.
5. Run only policy-allowed steps.
6. Verify one explicit readiness target.

The goal is not magical autonomy. The goal is one honest onboarding outcome faster.

## MVP scope

Pullstart V1 is scoped to:

- onboarding for one real proof repo type
- deterministic evidence and capability truth
- policy-gated planning and execution
- verification-first trust boundary
- explicit blocked and unknown outcomes
- one meaningful runnable success signal

The current declared-intent candidate is `setup.spec.yaml`, but declared intent is only one truth source. Repo, machine, and runtime-observed evidence also matter.

Policy gate owns execution permission with explicit classes: `auto-runnable`, `confirmation-required`, `manual-only`, `blocked`, and `forbidden`.

## Phase 5 proof status

### Proven now

- Pullstart has been exercised on one locked proof target (`file:///tmp/pullstart-phase5-proof-repo` at commit `4c87ba3f944c838f26ae152823fc254804d6bc9b`).
- The same repo/commit produced both a success run and a trustworthy blocked run.
- Blocked output preserved clear reason and one actionable next step (`verification target was already healthy before start-app` → stop existing process and rerun).

### Manual required

- Real onboarding still depends on user-controlled machine/service/access state (tool installs, env values, network/auth ownership).
- Ambiguous pre-healthy verification targets must be resolved by the user before rerun to prove repository-owned startup.
- Auth/network/private-registry certainty may remain unresolved until execution and is surfaced explicitly.

### Deferred

- Multi-repo portability claims.
- Broader orchestration UX (rich TUI logging, preference memory, smart rerun/up semantics) remains backlog work.
- Platform-style plugin/control-plane features remain out of MVP.

### Unresolved ambiguities

- If the verification target is already healthy before managed `start-app`, Pullstart cannot prove startup ownership and blocks for a clean rerun.
- Registry auth/network certainty is intentionally unknown before execution and only resolves during runtime attempts.

Pullstart V1 does not include:

- a broad developer platform
- universal support claims for every stack
- a memory product
- a plugin marketplace
- a team workflow dashboard
- a hidden autonomous planner-of-record

## What success looks like

For V1, success is simple:

- the repo is cloned
- Pullstart finds a policy-safe path from typed evidence
- Pullstart reaches one verified runnable state
- or Pullstart stops with a clear blocker/unknown explanation

## What is in the repo today

This repo currently includes:

- product framing docs
- MVP requirements and roadmap
- strict declared-intent loading
- repo and machine inspection
- deterministic evidence normalization and blocker-aware planning
- typed capability verdict generation
- policy-gated execution surfaces
- bounded execution and managed verification
- deterministic blocker classification for planner/runtime output
- first proof-repo validation artifacts for success and blocked outcomes

## Roadmap

The roadmap stays narrow:

- Phase 1: authority and evidence contract
- Phase 2: deterministic evidence core
- Phase 3: capability verdict engine
- Phase 4: policy-gated planner with agent review
- Phase 5: policy-gated execution
- Phase 6: verification and blocker truth
- Phase 7: one proof repo hardening

See [PROJECT.md](/Users/bilalimamoglu/repos/pullstart/PROJECT.md), [ROADMAP.md](/Users/bilalimamoglu/repos/pullstart/ROADMAP.md), and [REQUIREMENTS.md](/Users/bilalimamoglu/repos/pullstart/REQUIREMENTS.md) for the full framing.
