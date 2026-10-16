exports.up = async function(knex) {
  if (await knex.schema.hasTable('news_articles')) return;

  await knex.schema.createTable('news_articles', t => {
    t.increments('id').primary();
    t.string('title', 500).notNullable();
    t.text('link').notNullable().unique();
    t.string('source', 200);
    t.string('country_code', 4).notNullable();
    t.string('country_name', 100).notNullable();
    t.string('category', 30).notNullable();
    t.timestamp('published_at').notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index(['category', 'published_at']);
    t.index(['country_code', 'published_at']);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('news_articles');
};
