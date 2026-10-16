// Ownership checks for business claims: the owner sends a one-time code from the business's
// WhatsApp number to Vukafia's number, and the WhatsApp webhook confirms the sender matches.
exports.up = async function(knex) {
  if (await knex.schema.hasTable('claim_verifications')) return;

  await knex.schema.createTable('claim_verifications', t => {
    t.increments('id').primary();
    t.integer('listing_id').notNullable().references('id').inTable('listings').onDelete('CASCADE');
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('code', 12).notNullable();
    t.string('status', 20).notNullable().defaultTo('pending'); // pending | verified | completed | cancelled
    t.string('verified_phone', 30);
    t.timestamp('expires_at').notNullable();
    t.timestamp('verified_at');
    t.timestamp('completed_at');
    t.text('admin_notes');
    t.timestamps(true, true);
    t.index(['code', 'status']);
    t.index(['listing_id', 'user_id']);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('claim_verifications');
};
