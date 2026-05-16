# api-registro-femicidios

API to track femicides by the Observatorio de las Violencias de Género “Ahora
Que Sí Nos Ven”.

API set up using [PostgreSQL](https://www.postgresql.org/) as a database.

## Development

We use a dockerized development environment, so you will need
[docker](https://www.docker.com/) on your machine. No other dependencies are
required in your machine.

First, create `.env` file and then run `docker compose run --rm dev npm run config:template`. This process
will guide you through setting up your local `.env` file with all settings
properly set up.

Once you've set up your local `.env` file, you can run `docker compose up` to
start the application locally

Once your image is running, run migrations via `docker compose run dev knex migrate:latest`

To check the API open swagger in http://localhost:8081/ 

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
