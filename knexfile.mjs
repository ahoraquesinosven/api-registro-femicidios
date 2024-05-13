import config from 'src/config/values.js';

export default {
  client: 'pg',
  connection: config.db.connectionString,
  migrations: {
    loadExtensions: ['.mjs'],
    directory: './migrations'
  },
};
