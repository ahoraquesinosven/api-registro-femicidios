export const up = async (knex) => {
  return knex.schema.withSchema("public").createTable("feedItems", (table) => {
    table.increments("id");
    table.specificType("feedId", "varchar").notNullable();
    table.specificType("feedName", "varchar").notNullable();
    table.datetime("feedUpdatedAt").notNullable();
    table.datetime("createdAt").notNullable().defaultTo(knex.fn.now());
    table.datetime("updatedAt").notNullable().defaultTo(knex.fn.now());
    table.datetime("publishedAt").notNullable();
    table.specificType("feedItemKey", "varchar").notNullable();
    table.specificType("title", "varchar").notNullable();
    table.specificType("link", "varchar").notNullable();

    table.unique("feedItemKey");
  });
};

export const down = async (knex) => {
  return knex.schema.withSchema("public").dropTable("feedItems");
};
