export const up = async (knex) => {
  return knex.schema.withSchema("public").createTable("users", (table) => {
    table.increments("id");
    table.specificType("provider", "varchar").notNullable();
    table.specificType("providerId", "varchar").notNullable();
    table.specificType("name", "varchar").notNullable();
    table.specificType("email", "varchar").notNullable();
    table.specificType("pictureUrl", "varchar").notNullable();
    table.datetime("createdAt").notNullable().defaultTo(knex.fn.now());
    table.datetime("updatedAt").notNullable().defaultTo(knex.fn.now());

    table.unique(["provider", "providerId"]);
  });
};

export const down = async (knex) => {
  return knex.schema.withSchema("public").dropTable("users");
};
