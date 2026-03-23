# MVP Proof Scenario

## Scenario

Pullstart proves itself first on a Node.js API repository backed by PostgreSQL.

## Repo shape

The proof repo contains:

- `package.json`
- `.env.example`
- migration scripts
- a local app start command
- a health endpoint or equivalent verification command

## Starting state

The developer has cloned the repo, but the machine may still be missing:

- the right Node version
- installed dependencies
- a copied and completed env file
- a running PostgreSQL instance
- completed database migrations

## What Pullstart reads

- `setup.spec.yaml`
- repo metadata such as runtime and package manager files
- `.env.example`
- service hints like Docker configuration or migration commands

## What Pullstart does

1. Check declared prerequisites against machine state.
2. Build the shortest safe setup plan.
3. Run or guide the critical bootstrap steps.
4. Verify that the app boots and the health path passes.

## What counts as a win

The MVP wins if Pullstart ends in one of these trustworthy outcomes:

- the app starts locally and passes the declared verification path
- the user gets a structured blocker report that clearly identifies the missing prerequisite or failed setup step

Either result is useful. Silent ambiguity is not.
