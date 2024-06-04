import Knex from "knex";
import config from '../config';

export default new Knex({
  client: 'pg',
  connection: config.db.connectionString,
});
