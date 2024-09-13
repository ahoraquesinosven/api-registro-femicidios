export const up = async (knex) => {
    return knex.schema.withSchema('public')
        .createTable('victims', (table) => {
            table.increments('victim_id', { primaryKey: true }).notNullable();
            table.date('victim_creation').defaultTo(knex.fn.now()).notNullable();
            table.date('victim_last_update').defaultTo(knex.fn.now()).notNullable();
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
        })
        .createTable('aggresors', (table) => {
            table.increments('aggresor_id', { primaryKey: true }).notNullable();
            table.date('aggresor_creation').defaultTo(knex.fn.now()).notNullable();
            table.date('aggresor_last_update').defaultTo(knex.fn.now()).notNullable();
            table.specificType('aggresor_gender', 'character varying');
            table.specificType('aggresor_name_lastname', 'character varying');
            table.integer('aggresor_age');
            table.boolean('aggresor_legal_complaint_history');
            table.boolean('aggresor_cases_history');
            table.boolean('aggresor_captive_history');
            table.boolean('aggresor_behaviour_post_case');
         })
        .createTable('cases', (table) => {
            table.increments('case_id', { primaryKey: true }).notNullable();
            table.integer('victim_id').notNullable();
            table.integer('aggresor_id').notNullable();
            table.date('case_creation').defaultTo(knex.fn.now()).notNullable();
            table.date('last_update').defaultTo(knex.fn.now()).notNullable();
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

            table.foreign('victim_id').references('victims.victim_id');
            table.foreign('aggresor_id').references('aggresors.aggresor_id');
        });
};

export const down = async (knex) => {
    return knex.schema.withSchema('public')
        .dropTable('cases')
        .dropTable('victims')
        .dropTable('aggresors');
};
