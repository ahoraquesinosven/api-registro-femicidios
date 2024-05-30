export const up = async (knex) => {
  return knex.schema.withSchema("public").createTable("users", (table) => {
    table.increments("id");
    table.specificType("provider", "varchar");
    table.specificType("providerId", "varchar");
    table.specificType("name", "varchar");
    table.specificType("email", "varchar");
    table.specificType("pictureUrl", "varchar");
    table.datetime("createdAt").defaultTo(knex.fn.now());
    table.datetime("updatedAt").defaultTo(knex.fn.now());

    table.unique(["provider", "providerId"]);
  });
};

export const down = async (knex) => {
  return knex.schema.withSchema("public").dropTable("users");
};
