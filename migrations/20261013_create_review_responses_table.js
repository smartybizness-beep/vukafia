/**
 * Migration: Create review_responses table for seller replies
 */

exports.up = async function(knex) {
  return knex.schema.createTable('review_responses', t => {
    t.increments('id').primary();
    t.integer('review_id').references('id').inTable('reviews').onDelete('CASCADE');
    t.integer('respondent_user_id').references('id').inTable('users').onDelete('CASCADE');
    t.text('response_text').notNullable();
    t.enum('response_type', ['explanation', 'apology', 'resolution']).defaultTo('explanation');
    t.boolean('dispute_resolution').defaultTo(false);  // Does this response resolve dispute?
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('review_responses');
};
