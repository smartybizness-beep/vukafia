exports.up = async function(knex) {
  return knex.schema.createTable('templates', t => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.text('description');
    t.string('category').notNullable();
    t.string('file_url').notNullable();
    t.string('country_code').notNullable();
    t.string('country_name');
    t.string('trade_route');
    t.text('instructions');
    t.boolean('is_free').defaultTo(true);
    t.integer('access_days').defaultTo(7);
    t.string('template_type', 20).notNullable();
    t.boolean('active').defaultTo(true);
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('templates');
};
