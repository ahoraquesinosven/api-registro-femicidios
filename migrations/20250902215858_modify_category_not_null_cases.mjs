export const up = async (knex) => {
    return knex.schema.withSchema("public").alterTable("cases", (table) => {
        //modify format 3  
        table.specificType('caseCategory', 'character varying').notNullable().alter();
      });  
};

export const down = async (knex) => {
    return knex.schema.withSchema("public").alterTable("cases", (table) => {
        //revert modification 
       table.specificType('caseCategory', 'character varying').alter();
       
      });
};
