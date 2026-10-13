/**
 * Migration: Create review_evidence table for screenshots/receipts
 */

exports.up = async function(knex) {
  // Create enum type if using PostgreSQL
  if (knex.client.config.client === 'pg') {
    await knex.raw(`
      CREATE TYPE evidence_status_enum AS ENUM ('pending', 'verified', 'rejected');
    `).catch(() => {});
  }

  return knex.schema.createTable('review_evidence', t => {
    t.increments('id').primary();
    t.integer('review_id').references('id').inTable('reviews').onDelete('CASCADE');
    t.string('file_url').notNullable();
    t.string('file_type').defaultTo('image');
    t.string('mime_type');
    t.integer('file_size');
    t.text('description');
    t.enu('status', ['pending', 'verified', 'rejected']).defaultTo('pending');
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable('review_evidence');

  if (knex.client.config.client === 'pg') {
    await knex.raw(`DROP TYPE IF EXISTS evidence_status_enum CASCADE;`).catch(() => {});
  }
};
