// Legacy migration - table created in 20261013_3_create_template_access_table.js
exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable('template_access');
  // Skip if table already exists - it was created by the numbered migration
  if (hasTable) return;
};

exports.down = async function(knex) {
  // No-op in rollback
};
