export const up = async (knex) => {
    return knex.schema.withSchema("public").alterTable("cases", (table) => {
        table.specificType('victimBondAggressor', 'character varying');
      });  
};

export const down = async (knex) => {
    return knex.schema.withSchema("public").alterTable("cases", (table) => {
        table.dropColumn("victimBondAggressor");

       
      });
};
