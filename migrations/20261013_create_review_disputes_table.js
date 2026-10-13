/**
 * Migration: Create review_disputes table for auto-escalation
 * Bad reviews (low ratings) automatically flag for review
 */

exports.up = async function(knex) {
  if (knex.client.config.client === 'pg') {
    await knex.raw(`CREATE TYPE dispute_reason_enum AS ENUM ('low_rating', 'inappropriate_content', 'unverified_claim', 'abuse');`).catch(() => {});
    await knex.raw(`CREATE TYPE dispute_status_enum AS ENUM ('flagged', 'investigating', 'resolved');`).catch(() => {});
    await knex.raw(`CREATE TYPE dispute_resolution_enum AS ENUM ('upheld', 'removed', 'appeal_granted');`).catch(() => {});
  }

  return knex.schema.createTable('review_disputes', t => {
    t.increments('id').primary();
    t.integer('review_id').references('id').inTable('reviews').onDelete('CASCADE');
    t.integer('listing_id').references('id').inTable('listings').onDelete('CASCADE');
    t.enu('dispute_reason', ['low_rating', 'inappropriate_content', 'unverified_claim', 'abuse']).notNullable();
    t.enu('status', ['flagged', 'investigating', 'resolved']).defaultTo('flagged');
    t.text('investigation_notes');
    t.enu('resolution', ['upheld', 'removed', 'appeal_granted']);
    t.integer('assigned_to_user_id').references('id').inTable('users').onDelete('SET NULL');
    t.timestamp('resolved_at');
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable('review_disputes');

  if (knex.client.config.client === 'pg') {
    await knex.raw(`DROP TYPE IF EXISTS dispute_reason_enum CASCADE;`).catch(() => {});
    await knex.raw(`DROP TYPE IF EXISTS dispute_status_enum CASCADE;`).catch(() => {});
    await knex.raw(`DROP TYPE IF EXISTS dispute_resolution_enum CASCADE;`).catch(() => {});
  }
};
