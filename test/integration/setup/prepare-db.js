import pg from "pg";
import Knex from "knex";
import knexConfig from "../../../knexfile.mjs";

const connectionString = process.env.DB_CONNECTION_STRING;
if (!connectionString) {
  console.error("DB_CONNECTION_STRING is required to prepare the test database");
  process.exit(1);
}

const dbName = new URL(connectionString).pathname.replace(/^\//, "");

// CREATE DATABASE can't run while connected to the target db, so connect to the
// `postgres` maintenance db on the same instance to create the test db if missing.
const adminUrl = new URL(connectionString);
adminUrl.pathname = "/postgres";

const adminClient = new pg.Client({connectionString: adminUrl.toString()});
await adminClient.connect();
try {
  const {rowCount} = await adminClient.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName],
  );
  if (rowCount === 0) {
    // dbName comes from our own connection string, not user input.
    await adminClient.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Created test database "${dbName}"`);
  }
} finally {
  await adminClient.end();
}

const knex = Knex(knexConfig);
try {
  await knex.migrate.latest();
  console.log(`Migrations applied to "${dbName}"`);
} finally {
  await knex.destroy();
}
