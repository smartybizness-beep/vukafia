/**
 * Migration: Create checklist_steps table for individual steps in trade checklists
 */

exports.up = async function(knex) {
  return knex.schema.createTable('checklist_steps', t => {
    t.increments('id').primary();
    t.integer('checklist_id').references('id').inTable('checklists').onDelete('CASCADE');
    t.integer('step_number').notNullable();
    t.string('title').notNullable();  // "Get HS Code Classification"
    t.text('description');  // Detailed instructions
    t.text('documents_needed');  // "Invoice, Packing List, Airway Bill"
    t.text('responsible_party');  // "Exporter", "Broker", "Customs"
    t.string('duration');  // "1-2 days", "same day"
    t.decimal('estimated_cost', 10, 2);
    t.text('tips');  // Pro tips for this step
    t.integer('order').defaultTo(0);  // Sort order
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('checklist_steps');
};
