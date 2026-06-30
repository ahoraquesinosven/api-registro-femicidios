# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run inside Docker. No local Node/npm needed.

`HOST_UID` and `HOST_GID` (used by the `dev`/`test-api-server` services) are written to
`.env` by `./bin/setup-local-env` and loaded automatically. Never pass them on
the CLI — just run `docker compose ...` directly.

```bash
# First-time setup: create/complete .env (prompts for missing config) and run migrations
./bin/setup-local-env

# Start dev server (hot-reloads src/ changes)
docker compose up

# Run migrations
docker compose run dev knex migrate:latest

# Create a new migration
docker compose run dev knex migrate:make <name> --migrations-directory ./migrations --migrations-stub-extension .mjs

# Lint + check formatting (non-mutating; this is what CI runs)
docker compose run --rm dev npm run lint

# Auto-format and apply safe lint fixes across the project
docker compose run --rm dev npm run format

# Run a one-off command (scripts, etc.)
docker compose run --rm --entrypoint /bin/bash dev -c "<cmd>"

# Run the integration test suite end-to-end (test db + server + runner)
./bin/run-integration-tests

# Inspect server-under-test logs after a run (containers are stopped, not removed)
docker compose logs test-api-server

# Validate the OpenAPI document (npm test — fast, no database)
docker compose run --rm --entrypoint /bin/bash dev -c "npm test"
```

Swagger UI: http://localhost:8081/ (requires `docker compose up`)

## Architecture

Node.js (ESM) + Koa + PostgreSQL via Knex. Integration tests under `test/integration/`; OpenAPI validation is the `npm test` unit check.

### Request lifecycle

Every route is defined with `OpenApiRouter.operation()` (`src/openapi/index.js`). This single call does two things simultaneously: registers the Koa route with auth + validation middleware, and adds the path to the OpenAPI document. Never register a route without `operation()` or the spec will be out of sync.

Middleware order per request: auth check → AJV request validation → handler.

### OpenAPI validation

`npm test` runs `validate:openapi`: `src/scripts/dumpOpenapi.js` imports `src/routers/index.js` (whose `operation()` calls populate `openApiDocument.paths` as a side effect — without that import the dumped doc has no paths), writes the document to a file, then `redocly lint` checks it against the `recommended` ruleset. It needs no database and is fast.

Conventions the linter enforces, worth honoring when adding routes:
- Every operation needs a unique `operationId` and at least one `4xx` response.
- Secured operations document `401` via `{ $ref: "#/components/responses/UnauthorizedResponse" }`.
- Prefer registering request/response body schemas globally in `src/openapi/schemas.js` and `$ref`-ing them, over inline schemas — paginated list endpoints reuse the `paginatedEnvelope()` factory in `src/openapi/schemas/pagination.js`.
- `@redocly/cli` is a devDependency (see Dependencies below for how deps are added/rebuilt).

### Linting and formatting

[Biome](https://biomejs.dev) handles both formatting and linting (one tool, one
config — `biome.json`). It already parses/formats/lints `.ts`, so it's ready for
the planned TypeScript migration; actual type-checking (`tsc --noEmit`) will be a
separate step added at that time.

- `npm run lint` → `biome check .` — non-mutating; verifies **both** formatting
  and lint rules. This is the gate run in CI, so formatting drift fails the build.
- `npm run format` → `biome check --write .` — reformats and applies safe lint
  fixes across `src/`, `test/`, `migrations/`, and `knexfile.mjs` (scoped via
  `files.includes` in `biome.json`).
- CI runs on **GitHub Actions** (`.github/workflows/ci.yml`) for PRs into `dev`/
  `main`; Cloud Build (`cloudbuild.yaml`) remains deploy-only. Branch protection
  requiring the `lint` check is configured in GitHub settings, not in-repo.
- Editor integration: `.editorconfig` (kept in sync with `biome.json`) plus
  checked-in `.vscode/` settings recommending the Biome extension. nvim users
  point at the Biome LSP (`nvim-lspconfig`'s `biome`) or `conform.nvim`'s `biome`
  formatter; the Biome binary must be available on the host (standalone binary or
  the VS Code extension's bundled copy) since editors run it outside Docker.

### Dependencies

`node_modules` is **not** in the repo or the bind mount — it's installed into the
image at build time and surfaced to the running containers via the `node_modules`
named volume (so the bind-mounted project root doesn't shadow it). Consequences:

- Adding/upgrading a dependency: resolve it through npm so the version + lockfile
  are pinned (don't hand-edit `package.json`). Because the image's `node_modules`
  is root-owned, do it as root and chown the manifests back, then rebuild and
  recreate the volume:
  ```bash
  docker compose run --rm --user 0:0 --entrypoint /bin/bash dev -c \
    "npm i --save-dev <pkg> --package-lock-only && chown $HOST_UID:$HOST_GID package.json package-lock.json"
  docker compose build dev      # bake the new dep into the image
  docker compose down -v        # recreate node_modules volume from the rebuilt image
  ```
- After any dependency change, the `docker compose down -v` step is required —
  otherwise the existing `node_modules` volume stays stale and won't contain the
  new package.

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
