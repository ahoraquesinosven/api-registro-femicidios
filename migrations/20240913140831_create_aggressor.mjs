export const up = async (knex) => {
    knex.schema.withSchema('public').createTable('aggresors', (table) => {
        table.increments('aggresor_id', { primaryKey: true }).notNullable();
        table.date('aggresor_creation').defaultTo(knex.fn.now());
        table.date('aggresor_last_update').defaultTo(knex.fn.now());
        table.specificType('aggresor_gender', 'character varying');
        table.specificType('aggresor_name_lastname', 'character varying');
        table.integer('aggresor_age');
        table.boolean('aggresor_legal_complaint_history');
        table.boolean('aggresor_cases_history');
        table.boolean('aggresor_captive_history');
        table.boolean('aggresor_behaviour_post_case');
       });
}

export const down = async (knex) => {
    knex.withSchema('public').dropTable('aggresors') 
};
