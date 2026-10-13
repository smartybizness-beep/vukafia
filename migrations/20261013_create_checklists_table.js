/**
 * Migration: Create checklists table for trade compliance steps
 * Step-by-step guides for exporting from one country to another
 */

exports.up = async function(knex) {
  return knex.schema.createTable('checklists', t => {
    t.increments('id').primary();
    t.string('title').notNullable();  // "How to Export from Nigeria to Kenya"
    t.string('from_country_code').notNullable();  // NG
    t.string('from_country').notNullable();  // Nigeria
    t.string('to_country_code').notNullable();  // KE
    t.string('to_country').notNullable();  // Kenya
    t.integer('step_count').defaultTo(0);
    t.text('introduction');  // Overview of process
    t.text('documentation_notes');  // Required docs summary
    t.text('customs_notes');  // Customs-specific info
    t.text('timeline');  // How long the process takes
    t.decimal('estimated_cost', 10, 2);  // Rough estimate
    t.text('contacts');  // Key contacts formatted as JSON
    t.boolean('active').defaultTo(true);
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('checklists');
};
