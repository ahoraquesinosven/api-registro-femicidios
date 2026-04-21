export const up = async (knex) => {
  return knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "unaccent"');
};

export const down = async (knex) => {
  return knex.schema.raw('DROP EXTENSION IF EXISTS "unaccent"');
};
