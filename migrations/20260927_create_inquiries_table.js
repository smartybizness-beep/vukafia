/**
 * Migration: Create inquiries table for contact form and chatbot
 */

exports.up = async function(knex) {
  return knex.schema.createTable('inquiries', t => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.string('email').notNullable();
    t.string('phone');
    t.string('country');
    t.text('message').notNullable();
    t.enum('type', ['general', 'business_inquiry', 'technical', 'partnership', 'feedback']).defaultTo('general');
    t.enum('status', ['new', 'in_progress', 'resolved', 'closed']).defaultTo('new');
    t.text('admin_notes');
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('inquiries');
};
