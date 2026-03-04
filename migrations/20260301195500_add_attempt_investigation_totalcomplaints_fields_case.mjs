export const up = async (knex) => {
    return knex.schema.withSchema("public").alterTable("cases", (table) => {
        table.boolean('wasItAnAttempt');
        table.boolean('isInsufficientDataOrUnderInvestigation');
        table.integer('totalLegalComplaints');
         
      });  
};

export const down = async (knex) => {
    return knex.schema.withSchema("public").alterTable("cases", (table) => {
       table.dropColumn("wasItAnAttempt");
       table.dropColumn('isInsufficientDataOrUnderInvestigation');
       table.dropColumn('totalLegalComplaints');
      });
};
