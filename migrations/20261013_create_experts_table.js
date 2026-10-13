// Legacy migration - table created in 20261013_4_create_experts_table.js
exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable('experts');
  // Skip if table already exists - it was created by the numbered migration
  if (hasTable) return;
};

exports.down = async function(knex) {
  // No-op in rollback
};
