exports.up = async function(knex) {
  return knex.schema.createTableIfNotExists('review_disputes', t => {
    t.increments('id').primary();
    t.integer('review_id').references('id').inTable('reviews').onDelete('CASCADE');
    t.integer('listing_id').references('id').inTable('listings').onDelete('CASCADE');
    t.string('dispute_reason', 50).notNullable();
    t.string('status', 20).defaultTo('flagged');
    t.text('investigation_notes');
    t.string('resolution', 50);
    t.integer('assigned_to_user_id').references('id').inTable('users').onDelete('SET NULL');
    t.timestamp('resolved_at');
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('review_disputes');
};
