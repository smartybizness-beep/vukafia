exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable('experts');
  if (hasTable) return;

  return knex.schema.createTable('experts', t => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.text('bio');
    t.string('email');
    t.string('phone');
    t.string('expertise').notNullable();
    t.json('trade_routes_served');
    t.integer('years_experience').defaultTo(0);
    t.decimal('rating', 3, 2).defaultTo(0);
    t.boolean('verified').defaultTo(false);
    t.string('status', 30).defaultTo('pending_verification');
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('experts');
};
