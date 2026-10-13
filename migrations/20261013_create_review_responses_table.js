/**
 * Migration: Create review_responses table for seller replies
 */

exports.up = async function(knex) {
  if (knex.client.config.client === 'pg') {
    await knex.raw(`
      CREATE TYPE response_type_enum AS ENUM ('explanation', 'apology', 'resolution');
    `).catch(() => {});
  }

  return knex.schema.createTable('review_responses', t => {
    t.increments('id').primary();
    t.integer('review_id').references('id').inTable('reviews').onDelete('CASCADE');
    t.integer('respondent_user_id').references('id').inTable('users').onDelete('CASCADE');
    t.text('response_text').notNullable();
    t.enu('response_type', ['explanation', 'apology', 'resolution']).defaultTo('explanation');
    t.boolean('dispute_resolution').defaultTo(false);
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable('review_responses');

  if (knex.client.config.client === 'pg') {
    await knex.raw(`DROP TYPE IF EXISTS response_type_enum CASCADE;`).catch(() => {});
  }
};
