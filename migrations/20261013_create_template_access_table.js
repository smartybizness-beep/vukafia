/**
 * Migration: Create template_access table to track free 7-day access
 * After 7 days, users must pay to download
 */

exports.up = async function(knex) {
  return knex.schema.createTable('template_access', t => {
    t.increments('id').primary();
    t.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    t.integer('template_id').references('id').inTable('templates').onDelete('CASCADE');
    t.timestamp('first_access_at').notNullable();
    t.timestamp('free_access_expires_at').notNullable();
    t.boolean('has_paid').defaultTo(false);
    t.timestamp('paid_at');
    t.decimal('paid_amount', 10, 2);
    t.string('payment_ref');  // Paystack/Flutterwave reference
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('template_access');
};
