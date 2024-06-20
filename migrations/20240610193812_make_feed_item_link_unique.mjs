export const up = async (knex) => {
  return knex.schema.withSchema("public").alterTable("feedItems", (table) => {
    table.unique("link");
  });
};

export const down = async (knex) => {
  return knex.schema.withSchema("public").alterTable("feedItems", (table) => {
    table.dropUnique("link");
  });
};
