/**
 * Migration: Add 'restaurant' to the type constraint
 * Knex creates a CHECK constraint, not a PostgreSQL enum type
 */

exports.up = async function(knex) {
  // Drop existing constraint and create new one with 'restaurant'
  await knex.raw(`
    ALTER TABLE listings
    DROP CONSTRAINT listings_type_check
  `);

  return knex.raw(`
    ALTER TABLE listings
    ADD CONSTRAINT listings_type_check
    CHECK (type IN ('product', 'service', 'restaurant', 'tourism', 'medical'))
  `);
};

exports.down = async function(knex) {
  await knex.raw(`
    ALTER TABLE listings
    DROP CONSTRAINT listings_type_check
  `);

  return knex.raw(`
    ALTER TABLE listings
    ADD CONSTRAINT listings_type_check
    CHECK (type IN ('product', 'service', 'tourism', 'medical'))
  `);
};
