import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('email').unique().notNullable();
        table.integer('key_type').notNullable();
        table.string('pk').unique().notNullable();
        table.string('username').unique().notNullable();
        table.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('users');
}
