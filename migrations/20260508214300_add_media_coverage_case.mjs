export const up = async (knex) => {
  return knex.schema.withSchema("public").alterTable("cases", (table) => {
    table.specificType("hasMediaGenderPerspective", "boolean");
    table.specificType("coverageMediaPerspectiveNotes", "text");
  });
};

export const down = async (knex) => {
  return knex.schema.withSchema("public").alterTable("cases", (table) => {
    table.dropColumn("hasMediaGenderPerspective");
    table.dropColumn("coverageMediaPerspectiveNotes");
  });
};
