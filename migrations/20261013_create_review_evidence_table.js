/**
 * Migration: Create review_evidence table for screenshots/receipts
 */

exports.up = async function(knex) {
  return knex.schema.createTable('review_evidence', t => {
    t.increments('id').primary();
    t.integer('review_id').references('id').inTable('reviews').onDelete('CASCADE');
    t.string('file_url').notNullable();  // S3, Cloudinary, or local storage URL
    t.string('file_type').defaultTo('image');  // image, document, receipt
    t.string('mime_type');  // image/png, application/pdf, etc.
    t.integer('file_size');  // bytes
    t.text('description');  // "Screenshot of payment", "Delivery receipt", etc.
    t.enum('status', ['pending', 'verified', 'rejected']).defaultTo('pending');
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('review_evidence');
};
