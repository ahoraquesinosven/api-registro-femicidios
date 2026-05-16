export const up = async (knex) => {
  return knex.schema.withSchema("public").alterTable("feedItems", (table) => {
    table.specificType("snippet", "varchar");
  });
};

export const down = async (knex) => {
  return knex.schema.withSchema("public").alterTable("feedItems", (table) => {
    table.dropColumn("snippet");
  });
};
