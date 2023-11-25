import Knex from "knex";

export default new Knex({
  client: 'pg',
  connection: "postgresql://vivas:nosqueremos@db:5432/observatorio-femicidios",
});
