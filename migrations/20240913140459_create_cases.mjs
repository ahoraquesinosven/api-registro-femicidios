export const up = async (knex) => {
    return knex.schema.withSchema('public')
        .createTable('victims', (table) => {
            table.increments('id', { primaryKey: true }).notNullable();
            table.date('createdAt').defaultTo(knex.fn.now()).notNullable();
            table.date('updatedAt').defaultTo(knex.fn.now()).notNullable();
            table.specificType('fullName', 'character varying');
            table.integer('age');
            table.specificType('gender', 'character varying');
            table.string('nationality', 3);
            table.boolean('isSexualWorker');
            table.boolean('isMissingPerson');
            table.boolean('isNativePeople');
            table.boolean('isPregnant');
            table.boolean('hasDisabillity');
            table.specificType('occupation', 'character varying');
            table.boolean('hasChildren');
        })
        .createTable('aggressors', (table) => {
            table.increments('id', { primaryKey: true }).notNullable();
            table.date('createdAt').defaultTo(knex.fn.now()).notNullable();
            table.date('updatedAt').defaultTo(knex.fn.now()).notNullable();
            table.specificType('gender', 'character varying');
            table.specificType('fullName', 'character varying');
            table.integer('age');
            table.boolean('hasLegalComplaintHistory');
            table.boolean('hasPreviousCases');
            table.boolean('wasInPrison');
            table.specificType('behaviourPostCase', 'character varying');
         })
        .createTable('cases', (table) => {
            table.increments('id', { primaryKey: true }).notNullable();
            table.integer('victimId').notNullable();
            table.integer('aggressorId').notNullable();
            table.date('createdAt').defaultTo(knex.fn.now()).notNullable();
            table.date('updatedAt').defaultTo(knex.fn.now()).notNullable();
            table.date('occurredAt');
            table.specificType('momentOfDay', 'character varying');
            // TODO: Como queremos representar estos 4 campos?
            table.specificType('province', 'character varying');
            table.specificType('location', 'character varying');
            table.specificType('geographicLocation', 'character varying');
            table.specificType('place', 'character varying');
            table.specificType('murderWeapon', 'character varying');
            table.boolean('wasJudicialized');
            table.boolean('hadLegalComplaints');
            table.boolean('isRape');
            table.boolean('isRelatedToOrganizedCrime');
            table.text('organizedCrimeNotes');
            table.text('generalNotes');
            table.specificType('newsLinks', 'text ARRAY');

            table.foreign('victimId').references('victims.id');
            table.foreign('aggressorId').references('aggressors.id');
        });
};

export const down = async (knex) => {
    return knex.schema.withSchema('public')
        .dropTable('cases')
        .dropTable('victims')
        .dropTable('aggressors');
};
