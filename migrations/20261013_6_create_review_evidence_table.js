exports.up = async function(knex) {
  return knex.schema.createTableIfNotExists('review_evidence', t => {
    t.increments('id').primary();
    t.integer('review_id').references('id').inTable('reviews').onDelete('CASCADE');
    t.string('file_url').notNullable();
    t.string('file_type', 20).defaultTo('image');
    t.string('mime_type');
    t.integer('file_size');
    t.text('description');
    t.string('status', 20).defaultTo('pending');
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('review_evidence');
};
