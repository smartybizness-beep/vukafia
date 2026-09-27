/**
 * Migration: Reclassify restaurants to restaurant type
 * Background: Restaurants are stored as:
 * - category='Restaurant' with type='service'
 * - category='Food & Groceries' with "Restaurant" in name
 * Fix: Update all to type='restaurant'
 */

exports.up = async function(knex) {
  // Reclassify restaurants from Restaurant category
  await knex('listings')
    .where('category', 'Restaurant')
    .update({ type: 'restaurant' });

  // Reclassify restaurants by name (restaurant or cafe)
  await knex('listings')
    .where(function() {
      this.whereRaw(`LOWER(name) LIKE '%restaurant%'`)
          .orWhereRaw(`LOWER(name) LIKE '%cafe%'`);
    })
    .update({ type: 'restaurant', category: 'Restaurant' });

  return Promise.resolve();
};

exports.down = async function(knex) {
  // Revert if needed
  return knex('listings')
    .where('type', 'restaurant')
    .update({ type: 'service' });
};
