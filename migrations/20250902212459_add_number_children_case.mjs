export const up = async (knex) => {
    return knex.schema.withSchema("public").alterTable("victims", (table) => {
        table.integer("numberOfChildren");
      });  
};

export const down = async (knex) => {
    return knex.schema.withSchema("public").alterTable("victims", (table) => {
        table.dropColumn("numberOfChildren");
      });
};
