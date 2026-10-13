/**
 * Migration: Create templates table for trade documents
 * Stores export invoices, packing lists, compliance checklists by country
 */

exports.up = async function(knex) {
  if (knex.client.config.client === 'pg') {
    await knex.raw(`CREATE TYPE template_type_enum AS ENUM ('invoice', 'packing', 'permit', 'customs', 'insurance', 'checklist');`).catch(() => {});
  }

  return knex.schema.createTable('templates', t => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.text('description');
    t.string('category').notNullable();
    t.string('file_url').notNullable();
    t.string('country_code').notNullable();
    t.string('country_name');
    t.string('trade_route');
    t.text('instructions');
    t.boolean('is_free').defaultTo(true);
    t.integer('access_days').defaultTo(7);
    t.enu('template_type', ['invoice', 'packing', 'permit', 'customs', 'insurance', 'checklist']).notNullable();
    t.boolean('active').defaultTo(true);
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable('templates');

  if (knex.client.config.client === 'pg') {
    await knex.raw(`DROP TYPE IF EXISTS template_type_enum CASCADE;`).catch(() => {});
  }
};
