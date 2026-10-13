// Legacy migration - table created in 20261013_5_create_review_disputes_table.js
exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable('review_disputes');
  // Skip if table already exists - it was created by the numbered migration
  if (hasTable) return;
};

exports.down = async function(knex) {
  // No-op in rollback
};
