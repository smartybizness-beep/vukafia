/**
 * Migration: Increase cover_photo field length to support Google Maps URLs
 * Google Maps photo URLs are longer than varchar(255)
 */

exports.up = async function(knex) {
  // Change cover_photo from varchar(255) to text
  return knex.schema.alterTable('listings', function(t) {
    t.text('cover_photo').alter();
  });
};

exports.down = async function(knex) {
  // Revert back to varchar(255)
  return knex.schema.alterTable('listings', function(t) {
    t.string('cover_photo').alter();
  });
};
