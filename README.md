# api-registro-femicidios

API to track femicides by the Observatorio de las Violencias de Género “Ahora
Que Sí Nos Ven”.

API set up using [PostgreSQL](https://www.postgresql.org/) as a database.

## Development

We use a dockerized development environment, so you will need
[docker](https://www.docker.com/) on your machine. No other dependencies are
required in your machine.

First, run `docker compose run --rm api npm run config:template`. This process
will guide you through setting up your local `.env` file with all settings
properly set up.

Once you've set up your local `.env` file, you can run `docker compose up` to
start the application locally

Once your image is running, run migrations via `docker compose run api node_modules/.bin/knex migrate:latest`

## License

See the [LICENSE](./LICENSE) file for license rights and limitations (MIT).
