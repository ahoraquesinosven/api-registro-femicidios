export const up = async (knex) => {
    knex.schema.withSchema('public').createTable('cases', (table) => {
        table.increments('case_id', { primaryKey: true }).notNullable();
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
  
};

export const down = async (knex) => {
    knex.withSchema('public').dropTable('cases');
};
