export const up = async (knex) => {

  await knex("cases")
    .whereNull("wasItAnAttempt")
    .update({ wasItAnAttempt: false });


  await knex.schema.withSchema("public").alterTable("cases", (table) => {
    table.boolean("wasItAnAttempt").notNullable().alter();
  });
};

export const down = async (knex) => {
  return knex.schema.withSchema("public").alterTable("cases", (table) => {
    table.boolean("wasItAnAttempt").alter();
  });
};
