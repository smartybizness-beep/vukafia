/**
 * Migration: Fix restaurant type classification
 * Simple approach: find all rows with 'restaurant' or 'cafe' in name and set type='restaurant'
 */

exports.up = async function(knex) {
  // Update all restaurants by name using Knex query builder
  return knex('listings')
    .whereRaw("LOWER(name) ILIKE ?", ['%restaurant%'])
    .orWhereRaw("LOWER(name) ILIKE ?", ['%cafe%'])
    .orWhereRaw("LOWER(name) ILIKE ?", ['%food%'])
    .update({ type: 'restaurant', category: 'Restaurant' });
};

exports.down = async function(knex) {
  return knex('listings')
    .where('category', 'Restaurant')
    .update({ type: 'service' });
};
