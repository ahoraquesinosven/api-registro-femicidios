export const up = async (knex) => {
  return knex.schema.withSchema("public").alterTable("feed_items", (table) => {
    table.integer("assignedUserId").references("users.id");
    table.boolean("isDone").notNullable().defaultTo(false);
  });
};

export const down = async (knex) => {
  return knex.schema.withSchema("public").alterTable("feed_items", (table) => {
    table.dropColumn("assignedUserId");
    table.dropColumn("isDone");
  });
};
