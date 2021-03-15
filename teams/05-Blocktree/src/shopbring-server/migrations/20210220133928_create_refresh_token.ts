import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('refresh_tokens', (table) => {
        table.increments('id').primary().notNullable();
		table.uuid('token').unique().notNullable();
		table.integer('user_id').notNullable();
		table.boolean('valid').notNullable();
		table.dateTime('expires').notNullable();
		table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
		table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE').onUpdate('RESTRICT');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('refresh_tokens');
}
