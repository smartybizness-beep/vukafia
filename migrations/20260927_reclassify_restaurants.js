/**
 * Migration: Reclassify restaurants from service type to restaurant type
 * Background: Some listings have category='Restaurant' but type='service'
 * Fix: Update them to type='restaurant' for proper filtering
 */

exports.up = async function(knex) {
  return knex('listings')
    .where('category', 'Restaurant')
    .where('type', 'service')
    .update({ type: 'restaurant' });
};

exports.down = async function(knex) {
  // Revert if needed
  return knex('listings')
    .where('category', 'Restaurant')
    .where('type', 'restaurant')
    .update({ type: 'service' });
};
