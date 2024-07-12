export const up = async (knex) => {
    return knex.schema.withSchema("public").alterTable("feedItems", (table) => {
        table.boolean("isIrrelevant").notNullable().defaultTo(false);
      });  
};

export const down = async (knex) => {
    return knex.schema.withSchema("public").alterTable("feedItems", (table) => {
        table.dropColumn("isIrrelevant");
      });
};
