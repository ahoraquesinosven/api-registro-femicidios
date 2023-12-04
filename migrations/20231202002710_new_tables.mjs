
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  
 knex.schema.withSchema('public').createTable('Victims', (table) => {
  table.increments('victim_id', { primaryKey: true }).notNullable();
  table.date('victim_creation');
  table.date('victim_last_update');
  table.string('victim_name_lastname', 50);
  table.integer('victim_age');
  table.string('victim_nationality', 3);
  table.boolean('victim_prostitution');
  table.boolean('victim_missing');
  table.boolean('victim_native_people');
  table.boolean('victim_pregnant');
  table.boolean('victim_disabillity');
  table.string('victim_ocupation', 50);
  table.boolean('victim_children');
 });

 knex.schema.withSchema('public').createTable('Aggresors', (table) => {
  table.increments('aggresor_id', { primaryKey: true }).notNullable();
  table.date('aggresor_creation');
  table.date('aggresor_last_update');
  table.string('aggresor_gender', 3);
  table.string('aggresor_name_lastname', 50);
  table.integer('aggresor_age');
  table.boolean('aggresor_legal_complaint_history');
  table.boolean('aggresor_cases_history');
  table.boolean('aggresor_captive_history');
  table.boolean('aggresor_behaviour_post_case');
 });



knex.schema.withSchema('public').createTable('Cases', (table)=>{
  table.increments('case_id', { primaryKey: true}).notNullable();
  table.foreign('victim_id').references('Victims.victim_id');
  table.foreign('aggresor_id').references('Aggresors.aggresor_id');
  table.date('case_creation');
  table.date('last_update');
  table.date('incident_date');
  table.string('case_day_moment', 30);
  table.string('case_type', 20);
  table.string('case_gender', 3);
  table.string('case_province', 20);
  table.string('case_location', 30);
  table.string('case_geographic_ubication', 30);
  table.string('case_place', 20);
  table.string('case_form', 20);
  table.boolean('case_justice');
  table.integer('case_legal_complaints');
  table.boolean('case_rape');
  table.boolean('case_organized_crime');
  table.string('case_organized_crime_notes', 255);
  table.string('case_notes', 255);
  table.string('case_news_links', 255);
 })

 knex.schema.withSchema('public').createTable('Bonds', (table) => {
   table.incremets('bond_id');
   table.foreign('victim_id').references('Victims.victim_id'); 
   table.foreign('aggresor_id').references('Aggresors.aggresor_id');
 })


 knex.schema.withSchema('public').createTable('Children', (table) => { 
  table.increments('child_id', { primaryKey: true }).notNullable();
  table.foreign('victim_id').references('Victims.victim_id');
  table.date('child_creation');
  table.date('child_last_update');
  table.integer('victim_age');  
 })

}
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  
};
