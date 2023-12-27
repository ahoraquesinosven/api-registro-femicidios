/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  
 knex.schema.withSchema('public').createTable('victims', (table) => {
  table.increments('victim_id', { primaryKey: true }).notNullable();
  table.date('victim_creation'),notNullable();
  table.date('victim_last_update').notNullable();
  table.specificType('victim_name_lastname', 'character varying');
  table.integer('victim_age');
  table.string('victim_nationality', 3); 
  table.boolean('victim_prostitution');
  table.boolean('victim_is_missing');
  table.boolean('victim_is_native_people');
  table.boolean('victim_is_pregnant');
  table.boolean('victim_has_disabillity');
  table.specificType('victim_ocupation', 'character varying');
  table.boolean('victim_has_children');
 });


 knex.schema.withSchema('public').createTable('aggresors', (table) => {
  table.increments('aggresor_id', { primaryKey: true }).notNullable();
  table.date('aggresor_creation').notNullable();
  table.date('aggresor_last_update').notNullable();
  table.specificType('aggresor_gender', 'character varying');
  table.specificType('aggresor_name_lastname', 'character varying');
  table.integer('aggresor_age');
  table.boolean('aggresor_has_legal_complaint_history');
  table.boolean('aggresor_has_cases_history');
  table.boolean('aggresor_has_captive_history');
  table.specificType('aggresor_behaviour_post_case', 'character varying');
  table.specificType('aggresor_armed_forces', 'character varying');
 });


knex.schema.withSchema('public').createTable('cases', (table)=>{
  table.increments('case_id', { primaryKey: true}).notNullable();
  table.foreign('victim_id').references('victims.victim_id');
  table.foreign('aggresor_id').references('aggresors.aggresor_id');
  table.date('case_creation').notNullable();
  table.date('case_last_update').notNullable();
  table.date('case_incident_date');
  table.specificType('case_day_moment', 'character varying');
  table.specificType('case_type', 'character varying');
  table.specificType('case_gender', 'character varying');
  table.specificType('case_province', 'character varying');
  table.specificType('case_location', 'character varying');
  table.specificType('case_geographic_location', 'character varying');
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

 knex.schema.withSchema('public').createTable('relationships', (table) => {
   table.increments('bond_id');
   table.foreign('victim_id').references('victims.victim_id'); 
   table.foreign('aggresor_id').references('aggresors.aggresor_id');
 })


 knex.schema.withSchema('public').createTable('children', (table) => { 
  table.increments('child_id', { primaryKey: true }).notNullable();
  table.foreign('victim_id').references('victims.victim_id');
  table.date('child_creation').notNullable();
  table.date('child_last_update').notNullable();
  table.integer('victim_age');  
 })

}
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
 knex.withSchema.dropTable('children')
 knex.withSchema.dropTable('relationships') 
 knex.withSchema.dropTable('cases') 
 knex.withSchema.dropTable('aggresors') 
 knex.withSchema.dropTable('victims') 
};
