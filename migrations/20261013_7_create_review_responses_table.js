exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable('review_responses');
  if (hasTable) return;

  return knex.schema.createTable('review_responses', t => {
    t.increments('id').primary();
    t.integer('review_id').references('id').inTable('reviews').onDelete('CASCADE');
    t.integer('respondent_user_id').references('id').inTable('users').onDelete('CASCADE');
    t.text('response_text').notNullable();
    t.string('response_type', 20).defaultTo('explanation');
    t.boolean('dispute_resolution').defaultTo(false);
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('review_responses');
};
