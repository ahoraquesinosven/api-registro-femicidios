export const up = async (knex) => {
    return knex.schema.withSchema("public").alterTable("victims", (table) => {
        //modify format 3  
        table.specificType('nationality', 'character varying').alter();
      });  
};

export const down = async (knex) => {
    return knex.schema.withSchema("public").alterTable("victims", (table) => {
        //revert modification 
       table.string('nationality', 3).alter();
       
      });
};
