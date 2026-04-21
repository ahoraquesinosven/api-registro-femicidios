import Knex from "knex";
import config from '../config/values.js';

export default new Knex({
  client: 'pg',
  connection: config.db.connectionString,
  //debug:true enable this during develoment when you want to see all queries
});
