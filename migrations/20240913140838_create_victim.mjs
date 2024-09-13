export const up = async (knex) => {
    knex.schema.withSchema('public').createTable('victims', (table) => {
        table.increments('victim_id', { primaryKey: true }).notNullable();
        table.date('victim_creation').defaultTo(knex.fn.now());
        table.date('victim_last_update').defaultTo(knex.fn.now());
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
    }

export const down = async (knex) => {
    knex.withSchema('public').dropTable('victims') 
};
