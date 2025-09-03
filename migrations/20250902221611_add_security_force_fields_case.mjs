export const up = async (knex) => {
    return knex.schema.withSchema("public").alterTable("aggressors", (table) => {
        table.boolean("belongsSecurityForce");
        table.specificType('securityForce', 'character varying')
      });  
};

export const down = async (knex) => {
    return knex.schema.withSchema("public").alterTable("aggressors", (table) => {
        table.dropColumn("belongsSecurityForce");
        table.dropColumn("securityForce");
        
      });
};
