export default {
  client: 'pg',
  connection: "postgresql://vivas:nosqueremos@db:5432/observatorio-femicidios",
  migrations: {
    loadExtensions: ['.mjs'],
    directory: './migrations'
  },
};
