/**
 * Migration: Create review_disputes table for auto-escalation
 * Bad reviews (low ratings) automatically flag for review
 */

exports.up = async function(knex) {
  return knex.schema.createTable('review_disputes', t => {
    t.increments('id').primary();
    t.integer('review_id').references('id').inTable('reviews').onDelete('CASCADE');
    t.integer('listing_id').references('id').inTable('listings').onDelete('CASCADE');
    t.enum('dispute_reason', ['low_rating', 'inappropriate_content', 'unverified_claim', 'abuse']).notNullable();
    t.enum('status', ['flagged', 'investigating', 'resolved']).defaultTo('flagged');
    t.text('investigation_notes');
    t.enum('resolution', ['upheld', 'removed', 'appeal_granted']).defaultTo(null);
    t.integer('assigned_to_user_id').references('id').inTable('users').onDelete('SET NULL');
    t.timestamp('resolved_at');
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('review_disputes');
};
