exports.up = async function(knex) {
  return knex.schema.alterTable('reviews', t => {
    t.integer('reviewer_user_id').references('id').inTable('users').onDelete('SET NULL');
    t.string('reviewer_type', 20).defaultTo('buyer');
    t.string('status', 20).defaultTo('pending');
    t.boolean('evidence_required').defaultTo(false);
    t.text('admin_notes');
  });
};

exports.down = async function(knex) {
  return knex.schema.alterTable('reviews', t => {
    t.dropColumn('reviewer_user_id');
    t.dropColumn('reviewer_type');
    t.dropColumn('status');
    t.dropColumn('evidence_required');
    t.dropColumn('admin_notes');
  });
};
