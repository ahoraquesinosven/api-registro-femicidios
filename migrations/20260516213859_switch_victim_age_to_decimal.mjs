export const up = async (knex) => {
  return knex.schema.withSchema("public").alterTable("victims", (table) => {
    table.decimal("age").alter();
  });
};

export const down = async (knex) => {
  return knex.schema.withSchema("public").alterTable("victims", (table) => {
    table.integer("age").alter();
  });
};
