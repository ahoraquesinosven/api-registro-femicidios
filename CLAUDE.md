# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run inside Docker. No local Node/npm needed.

```bash
# First-time setup: create/complete .env (prompts for missing config) and run migrations
./bin/setup-local-env

# Start dev server (hot-reloads src/ changes)
docker compose up

# Run migrations
docker compose run dev knex migrate:latest

# Create a new migration
docker compose run dev knex migrate:make <name> --migrations-directory ./migrations --migrations-stub-extension .mjs

# Run a one-off command (lint, scripts, etc.)
docker compose run --rm --entrypoint /bin/bash dev -c "<cmd>"
```

Swagger UI: http://localhost:8081/ (requires `docker compose up`)

## Architecture

Node.js (ESM) + Koa + PostgreSQL via Knex. No test suite.

### Request lifecycle

Every route is defined with `OpenApiRouter.operation()` (`src/openapi/index.js`). This single call does two things simultaneously: registers the Koa route with auth + validation middleware, and adds the path to the OpenAPI document. Never register a route without `operation()` or the spec will be out of sync.

Middleware order per request: auth check → AJV request validation → handler.

### Database

Three main tables: `cases`, `victims`, `aggressors`. Cases always join both — `case.victimId` and `case.aggressorId` are the FK columns.

`src/services/knex.js` adds three custom Knex QueryBuilder extensions:
- `.whereUnaccentedMatch(field, value)` — case/accent-insensitive ILIKE (uses the `unaccent` pg extension)
- `.whereNameMatch(field, value)` — splits value on spaces, ORs an unaccented match per token
- `.toNestedObjects({rootQualifier, fields})` — selects aliased columns and maps them back to nested JS objects (e.g. `"victim.fullName"` → `result.victim.fullName`)

### Auth

Two security schemes (`src/openapi/securitySchemes.js`):
- `oauth` — verifies a Bearer JWT token via OIDC (user-facing)
- `internal` — checks `Authorization` header against a static key from config (server-to-server, used only on POST /cases)

### OpenAPI schemas and enums

`src/openapi/schemas/case.js` — the main Case JSON Schema for request validation.

`src/data/*.js` — enum arrays for every enumerated field (provinces, genders, weapons, etc.). These are imported into `src/openapi/schemas.js` as named schemas and referenced as `{ $ref: "#/components/schemas/..." }` in route specs and in `case.js`.

### Adding a new field to a case

1. Write a migration under `migrations/` (`.mjs` extension).
2. Add the field to `src/openapi/schemas/case.js` with JSON Schema validation.
3. Add any cross-field validation logic to `caseValidations()` in `src/routers/cases.js`.
4. In the PUT handler's `defaultCase`, `defaultVictim`, or `defaultAggressor` object, add the new field with value `null`. This ensures edits always reset fields not sent from the UI.
5. In the GET `/{caseId}` handler's `toNestedObjects` fields list, add the new field so it's returned.
6. If it's an enum, create a file in `src/data/` and add it to `src/openapi/schemas.js`.

### Feed / Google Alerts

RSS feeds from Google Alerts are configured in `src/services/google/`. Alerts are set up on the `alertafemicidios@ahoraquesinosven.org.ar` account.
