export const up = async (knex) => {
    return knex.schema.withSchema("public").alterTable("aggressors", (table) => {
       //save as an array
        table.specificType('behaviourPostCase', 'text ARRAY').alter();
      });  
};

export const down = async (knex) => {
    return knex.schema.withSchema("public").alterTable("aggressors", (table) => {
        //revert modification 
       table.specificType('behaviourPostCase', 'character varying').alter();
       
      });
};
