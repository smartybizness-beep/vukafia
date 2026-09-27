/**
 * Migration: Fix restaurant type classification
 * Simple approach: find all rows with 'restaurant' or 'cafe' in name and set type='restaurant'
 */

exports.up = async function(knex) {
  // Update all restaurants regardless of current category
  return knex.raw(`
    UPDATE listings
    SET type = 'restaurant', category = 'Restaurant'
    WHERE LOWER(name) LIKE '%restaurant%'
       OR LOWER(name) LIKE '%cafe%'
       OR LOWER(name) LIKE '%food%'
  `);
};

exports.down = async function(knex) {
  return knex.raw(`
    UPDATE listings
    SET type = 'service'
    WHERE category = 'Restaurant'
  `);
};
