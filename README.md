# api-registro-femicidios

API to track femicides by the Observatorio de las Violencias de Género “Ahora
Que Sí Nos Ven”.

API set up using [PostgreSQL](https://www.postgresql.org/) as a database.

## Development

We use a dockerized development environment, so you will need
[docker](https://www.docker.com/) on your machine. No other dependencies are
required in your machine.

Run the setup script:

```bash
./bin/setup-local-env
```

It is idempotent (safe to re-run) and will:

- Create a local `.env` file if missing, pinning `HOST_UID`/`HOST_GID` so the
  container writes files as your user.
- Detect required settings that have no value and prompt you for each one
  (showing what it needs), writing your answers to `.env`.
- Initialize the database and run migrations.

When it finishes, start the application locally:

```bash
docker compose up
```

Once your image is running, run migrations via docker compose run dev knex migrate:latest

To check the API open swagger in http://localhost:8081/ 

## Testing

### Integration tests

Integration tests exercise the real HTTP stack against a real PostgreSQL
database. They run inside the dev container against a dedicated test database
(`observatorio-femicidios-test`) on the same db instance, kept separate from
your development data. From the host:

```bash
./bin/run-integration-tests
```

This stands up the database, waits for it, creates/migrates the test database,
and runs the suite (`npm run test:integration`). The tests live under
`test/integration/`. The server under test and the test runner run as separate
containers, so their logs never interleave.

When the run finishes the containers are stopped but not removed, so the
server-under-test logs stay reachable. To inspect them after the tests are
done:

```bash
docker compose logs test-api-server
```

### Unit tests

Unit tests (nimble, parallel, no database) run via `npm test`. Future tests will
live under `test/unit/`.

Today the suite consists of OpenAPI validation: the spec is assembled at runtime
from the route `operation()` calls, dumped to a file, and linted with
[`@redocly/cli`](https://redocly.com/docs/cli/) against its `recommended`
ruleset. This catches broken `$ref`s, unused/duplicate components, missing
`operationId`s and other spec-conformance issues before they reach a running
server. Run it on its own with:

```bash
docker compose run --rm --entrypoint /bin/bash dev -c "npm run validate:openapi"
```

`validate:openapi` runs `dump:openapi` (writes the document via
`src/scripts/dumpOpenapi.js`) and then `redocly lint`. It's cheap and needs no
database, so it doubles as our first quick unit test and is wired into `npm test`.

## Running only API or with Frontend
- To run just the API, remember to go to `.env` file and comment the line `AUTH_PROVIDER_REDIRECT_URI=http://localhost:5173/oauth/cb`
- To run the API and the Frontend together, go to `.env` file and review the line `AUTH_PROVIDER_REDIRECT_URI=http://localhost:5173/oauth/cb` is NOT commented.

## Cases
- For `Create` start from `src/routes/cases` and check the POST endpoint
- For `Update` start from `src/routes/cases` and check the PUT endpoint
- If a new field is added:
  - update CASE schema in `src/openapi/schemas/case.js` and make sure to add validations using json schemas (see ## Ref Link below)
  - then go to `src/routes/cases`
  - make sure to review what case validations are needed
  - For create / POST, nothing is required since it is using the other functions
  - For edit / PUT, remember to add default value in `null` for the new fields in defaultCase or defaultVctim or defaultAggressor
  - For get by ID, remeber to add the new field in the nested object 


## Feed Items
- Alerts are configured in google alerts using email `alertafemicidios@ahoraquesinosven.org.ar`
- For example, we configured: adulta mayor asesinada,  anciana asesinada, crimen de odio, crimen pasional,  femicidio, femicidio vinculado, joven asesinada, jubilada asesinada, lesboodio, violencia de genero, violencia machista, etc. 
- Then for each rss feed, we configure it in `src/services/google/alerts.js`

## Ref links
- To add validations: https://json-schema.org/understanding-json-schema/reference/conditionals 
- OpenAPI especification: https://swagger.io/specification/ 

## License

See the [LICENSE](./LICENSE) file for license rights and limitations (MIT).
