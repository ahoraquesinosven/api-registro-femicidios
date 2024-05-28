export const up = async (knex) => {
  return knex.schema.withSchema("public").createTable("feed_items", (table) => {
    table.increments("id");
    table.specificType("feedId", "varchar");
    table.specificType("feedName", "varchar");
    table.datetime("feedUpdatedAt");
    table.datetime("createdAt").defaultTo(knex.fn.now());
    table.datetime("updatedAt").defaultTo(knex.fn.now());
    table.datetime("publishedAt");
    table.specificType("feedItemKey", "varchar");
    table.specificType("title", "varchar");
    table.specificType("link", "varchar");

    table.unique("feedItemKey");
  });
};

export const down = async (knex) => {
  return knex.schema.withSchema("public").dropTable("feed_items");
};
