/**
 * Migration: Enhance reviews table for verified reviews feature
 * Adds: reviewer_user_id, reviewer_type, status, evidence_required flag
 */

exports.up = async function(knex) {
  return knex.schema.alterTable('reviews', t => {
    t.integer('reviewer_user_id').references('id').inTable('users').onDelete('SET NULL');
    t.enum('reviewer_type', ['buyer', 'seller']).defaultTo('buyer');
    t.enum('status', ['pending', 'approved', 'disputed', 'resolved']).defaultTo('pending');
    t.boolean('evidence_required').defaultTo(false);
    t.text('admin_notes');
  });
};

exports.down = async function(knex) {
  return knex.schema.alterTable('reviews', t => {
    t.dropColumn('reviewer_user_id');
    t.dropColumn('reviewer_type');
    t.dropColumn('status');
    t.dropColumn('evidence_required');
    t.dropColumn('admin_notes');
  });
};
