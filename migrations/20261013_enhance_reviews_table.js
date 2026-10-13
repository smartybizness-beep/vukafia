// Legacy migration - table enhanced in 20261013_8_enhance_reviews_table.js
exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable('reviews');
  if (!hasTable) return;

  const hasReviewerType = await knex.schema.hasColumn('reviews', 'reviewer_type');
  // Skip if columns already exist - they were added by the numbered migration
  if (hasReviewerType) return;
};

exports.down = async function(knex) {
  // No-op in rollback
};
