exports.up = async function(knex) {
  return knex.schema.createTable('template_access', t => {
    t.increments('id').primary();
    t.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    t.integer('template_id').references('id').inTable('templates').onDelete('CASCADE');
    t.timestamp('first_access_at');
    t.timestamp('free_access_expires_at');
    t.boolean('has_paid').defaultTo(false);
    t.string('payment_reference');
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('template_access');
};
