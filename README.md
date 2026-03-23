# Pullstart

Pullstart helps developers get a cloned repo into one verified runnable state with less guessing.

Version 1 stays focused on onboarding. It reads onboarding intent, checks repo and machine reality, chooses the safest next steps, runs or guides the setup flow, and proves when the repo is actually ready.

## Who it is for

Pullstart is for developers who:

- just cloned a repo
- want to get it running locally
- do not want to piece setup together from old docs, failed commands, and team lore

The first proof target is a Node.js API repo with PostgreSQL, env setup, migrations, and one health check.

## How it works

Pullstart V1 follows a simple flow:

1. Read the onboarding contract if the repo has one.
2. Inspect the repo and the current machine.
3. Decide what Pullstart can do now and what still needs the user.
4. Run or guide the shortest safe setup path.
5. Verify one clear success signal.

The goal is not to explain everything. The goal is to help the user reach a working repo faster.

## MVP scope

Pullstart V1 is scoped to:

- onboarding for one real proof repo type
- a machine-readable onboarding contract concept
- repo inspection, machine inspection, capability checks, execution, and verification
- one meaningful runnable success signal
- clear blocker output when setup cannot continue safely

The current contract candidate is `setup.spec.yaml`, but the idea of an onboarding contract matters more than the exact filename.

## Phase 5 proof status

### Proven now

- Pullstart has been exercised on one locked proof target (`file:///tmp/pullstart-phase5-proof-repo` at commit `4c87ba3f944c838f26ae152823fc254804d6bc9b`).
- The same repo/commit produced both a success run and a trustworthy blocked run.
- Blocked output preserved clear reason and one actionable next step (`verification target was already healthy before start-app` → stop existing process and rerun).

### Manual required

- Real repo onboarding still depends on user-controlled machine/service state (tool installs, env values, service startup ownership).
- Ambiguous pre-healthy verification targets must be resolved by the user before rerun to prove repository-owned startup.
- Auth/network certainty for registry access remains unknown pre-execution and is surfaced as caveats, not hidden.

### Deferred

- Multi-repo portability claims.
- Broader orchestration UX (rich TUI logging, preference memory, smart rerun/up semantics) remains backlog work.
- Platform-style plugin/control-plane features remain out of MVP.

### Unresolved ambiguities

- If the verification target is already healthy before managed `start-app`, Pullstart cannot prove startup ownership and blocks for a clean rerun.
- Registry auth/network certainty is intentionally unknown before execution and only resolves during runtime attempts.

Pullstart V1 does not include:

- a broad developer platform
- generic repo analysis for every use case
- a memory product
- a plugin marketplace
- a team workflow dashboard
- a hidden automation system with unclear side effects

## What success looks like

For V1, success is simple:

- the repo is cloned
- Pullstart finds the shortest safe bootstrap path
- Pullstart reaches one verified runnable state
- or Pullstart stops with a clear, honest blocker message

## What is in the repo today

This repo currently includes:

- product framing docs
- MVP requirements and roadmap
- a strict contract loader
- repo and machine inspection
- a planner that can produce a blocker-first bootstrap plan
- capability verdict generation
- bounded execution and managed verification
- deterministic blocker classification for planner/runtime output
- first proof-repo validation artifacts for success and blocked outcomes

## Roadmap

The roadmap stays narrow:

- Phase 1: contract model and proof slice
- Phase 2: planner and inspection
- Phase 3: capability verdict, execution, and verification
- Phase 4: failure classification
- Phase 5: one real repo proof

See [PROJECT.md](/Users/bilalimamoglu/repos/pullstart/PROJECT.md), [ROADMAP.md](/Users/bilalimamoglu/repos/pullstart/ROADMAP.md), and [REQUIREMENTS.md](/Users/bilalimamoglu/repos/pullstart/REQUIREMENTS.md) for the full framing.
