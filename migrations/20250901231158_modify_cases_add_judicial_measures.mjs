export const up = async (knex) => {
    return knex.schema.withSchema("public").alterTable("cases", (table) => {
        table.specificType('judicialMeasures', 'text ARRAY');
      });  
};

export const down = async (knex) => {
    return knex.schema.withSchema("public").alterTable("cases", (table) => {
        table.dropColumn("judicialMeasures");

       
      });
};
