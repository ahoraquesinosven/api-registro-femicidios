const Knex = require('knex');

const knex = new Knex({
  client: 'pg',
  connection: "postgresql://vivas:nosqueremos@db:5432/observatorio-femicidios",
});

module.exports = knex;
