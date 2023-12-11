
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  
 knex.schema.withSchema('public').createTable('victims', (table) => {
  table.increments('victim_id', { primaryKey: true }).notNullable();
  table.date('victim_creation');
  table.date('victim_last_update');
  table.specificType('victim_name_lastname', 'character varying');
  table.integer('victim_age');
  table.string('victim_nationality', 3); 
  table.boolean('victim_prostitution');
  table.boolean('victim_missing');
  table.boolean('victim_native_people');
  table.boolean('victim_pregnant');
  table.boolean('victim_disabillity');
  table.text('victim_ocupation');
  table.boolean('victim_children');
 });


 knex.schema.withSchema('public').createTable('aggresors', (table) => {
  table.increments('aggresor_id', { primaryKey: true }).notNullable();
  table.date('aggresor_creation');
  table.date('aggresor_last_update');
  table.specificType('aggresor_gender', 'character varying');
  table.specificType('aggresor_name_lastname', 'character varying');
  table.integer('aggresor_age');
  table.boolean('aggresor_legal_complaint_history');
  table.boolean('aggresor_cases_history');
  table.boolean('aggresor_captive_history');
  table.boolean('aggresor_behaviour_post_case');
 });


knex.schema.withSchema('public').createTable('cases', (table)=>{
  table.increments('case_id', { primaryKey: true}).notNullable();
  table.foreign('victim_id').references('victims.victim_id');
  table.foreign('aggresor_id').references('aggresors.aggresor_id');
  table.date('case_creation');
  table.date('last_update');
  table.date('incident_date');
  table.specificType('case_day_moment', 'character varying');
  table.specificType('case_type', 'character varying');
  table.specificType('case_gender', 'character varying');
  table.specificType('case_province', 'character varying');
  table.specificType('case_location', 'character varying');
  table.specificType('case_geographic_ubication', 'character varying');
  table.specificType('case_place', 'character varying');
  table.specificType('case_form', 'character varying');
  table.boolean('case_justice');
  table.integer('case_legal_complaints');
  table.boolean('case_rape');
  table.boolean('case_organized_crime');
  table.text('case_organized_crime_notes');
  table.text('case_notes');
  table.specificType('case_news_links', 'text ARRAY');
 })

 knex.schema.withSchema('public').createTable('bonds', (table) => {
   table.increments('bond_id');
   table.foreign('victim_id').references('victims.victim_id'); 
   table.foreign('aggresor_id').references('aggresors.aggresor_id');
 })


 knex.schema.withSchema('public').createTable('children', (table) => { 
  table.increments('child_id', { primaryKey: true }).notNullable();
  table.foreign('victim_id').references('victims.victim_id');
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
 knex.withSchema.dropTable('children')
 knex.withSchema.dropTable('bonds') 
 knex.withSchema.dropTable('cases') 
 knex.withSchema.dropTable('aggresors') 
 knex.withSchema.dropTable('victims') 
};
