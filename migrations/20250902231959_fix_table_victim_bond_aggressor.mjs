export const up = async (knex) => {
    return knex.schema.withSchema("public")
      .alterTable("victims", (table) => {
        table.specificType('victimBondAggressor', 'character varying');
      })
      .alterTable("cases", (table) => {
        table.dropColumn('victimBondAggressor');
      });  
};

export const down = async (knex) => {
    return knex.schema.withSchema("public")
      .alterTable("victims", (table) => {
        table.dropColumn("victimBondAggressor");       
      })
      .alterTable("cases", (table) => {
        table.specificType('victimBondAggressor', 'character varying');
      });
};
