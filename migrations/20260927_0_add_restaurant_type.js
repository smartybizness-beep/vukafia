/**
 * Migration: Add 'restaurant' to the type enum
 * This must run before the restaurant reclassification migration
 */

exports.up = async function(knex) {
  // PostgreSQL: Alter the enum type to include 'restaurant'
  return knex.raw(`ALTER TYPE listings_type ADD VALUE 'restaurant' BEFORE 'tourism'`);
};

exports.down = async function(knex) {
  // Cannot easily remove from enum in PostgreSQL, so this is a no-op
  return Promise.resolve();
};
