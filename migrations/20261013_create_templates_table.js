/**
 * Migration: Create templates table for trade documents
 * Stores export invoices, packing lists, compliance checklists by country
 */

exports.up = async function(knex) {
  return knex.schema.createTable('templates', t => {
    t.increments('id').primary();
    t.string('name').notNullable();  // "Export Invoice", "Packing List", etc.
    t.text('description');
    t.string('category').notNullable();  // "invoicing", "shipping", "compliance", "customs"
    t.string('file_url').notNullable();  // PDF/DOC URL
    t.string('country_code').notNullable();  // NG, KE, GH, BJ for Nigeria, Kenya, Ghana, Benin
    t.string('country_name');  // Nigeria, Kenya, Ghana, Benin
    t.string('trade_route');  // "Nigeria-Kenya", "Kenya-Ghana", etc.
    t.text('instructions');  // How to fill out template
    t.boolean('is_free').defaultTo(true);  // Free access model
    t.integer('access_days').defaultTo(7);  // Free access duration (7 days)
    t.enum('template_type', ['invoice', 'packing', 'permit', 'customs', 'insurance', 'checklist']).notNullable();
    t.boolean('active').defaultTo(true);
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('templates');
};
