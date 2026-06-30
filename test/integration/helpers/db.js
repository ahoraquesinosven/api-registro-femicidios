import knex from "../../../src/services/knex.js";

const TABLES = ["feedItems", "cases", "victims", "aggressors", "users"];

export async function resetDb() {
  await knex.raw(
    `TRUNCATE ${TABLES.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE`,
  );
}

export async function closeDb() {
  await knex.destroy();
}

export {knex};
