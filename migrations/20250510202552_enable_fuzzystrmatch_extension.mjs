export const up = async (knex) => {
  return knex.raw("CREATE EXTENSION fuzzystrmatch");
};

export const down = async (knex) => {
  return knex.raw("DROP EXTENSION fuzzystrmatch");
};
