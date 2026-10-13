exports.up = async function(knex) {
  // Add columns only if they don't exist
  const columns = ['reviewer_user_id', 'reviewer_type', 'status', 'evidence_required', 'admin_notes'];
  const hasAllColumns = await knex.raw(`
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_name='reviews' AND column_name IN (${columns.map(() => '?').join(',')})
  `, columns).then(result => result.rows[0].count >= columns.length);

  if (hasAllColumns) return;

  return knex.schema.alterTable('reviews', t => {
    t.integer('reviewer_user_id').references('id').inTable('users').onDelete('SET NULL');
    t.string('reviewer_type', 20).defaultTo('buyer');
    t.string('status', 20).defaultTo('pending');
    t.boolean('evidence_required').defaultTo(false);
    t.text('admin_notes');
  }).catch(() => {});  // Ignore if columns already exist
};

exports.down = async function(knex) {
  return knex.schema.alterTable('reviews', t => {
    t.dropColumn('reviewer_user_id');
    t.dropColumn('reviewer_type');
    t.dropColumn('status');
    t.dropColumn('evidence_required');
    t.dropColumn('admin_notes');
  }).catch(() => {});
};
