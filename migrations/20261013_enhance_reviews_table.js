/**
 * Migration: Enhance reviews table for verified reviews feature
 * Adds: reviewer_user_id, reviewer_type, status, evidence_required flag
 */

exports.up = async function(knex) {
  // Create enum types first if using PostgreSQL
  if (knex.client.config.client === 'pg') {
    await knex.raw(`
      CREATE TYPE reviewer_type_enum AS ENUM ('buyer', 'seller');
    `).catch(() => {}); // Ignore if already exists

    await knex.raw(`
      CREATE TYPE review_status_enum AS ENUM ('pending', 'approved', 'disputed', 'resolved');
    `).catch(() => {});
  }

  return knex.schema.alterTable('reviews', t => {
    t.integer('reviewer_user_id').references('id').inTable('users').onDelete('SET NULL');
    t.enu('reviewer_type', ['buyer', 'seller']).defaultTo('buyer');
    t.enu('status', ['pending', 'approved', 'disputed', 'resolved']).defaultTo('pending');
    t.boolean('evidence_required').defaultTo(false);
    t.text('admin_notes');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('reviews', t => {
    t.dropColumn('reviewer_user_id');
    t.dropColumn('reviewer_type');
    t.dropColumn('status');
    t.dropColumn('evidence_required');
    t.dropColumn('admin_notes');
  });

  // Drop enum types if using PostgreSQL
  if (knex.client.config.client === 'pg') {
    await knex.raw(`DROP TYPE IF EXISTS reviewer_type_enum CASCADE;`).catch(() => {});
    await knex.raw(`DROP TYPE IF EXISTS review_status_enum CASCADE;`).catch(() => {});
  }
};
