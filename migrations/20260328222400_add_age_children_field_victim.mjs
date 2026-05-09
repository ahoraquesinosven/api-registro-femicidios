export const up = async (knex) => {
    return knex.schema.withSchema("public").alterTable("victims", (table) => {
        table.specificType('ageOfChildren', 'float ARRAY');

         
      });  
};

export const down = async (knex) => {
    return knex.schema.withSchema("public").alterTable("victims", (table) => {
        table.dropColumn("ageOfChildren");
      });
};
