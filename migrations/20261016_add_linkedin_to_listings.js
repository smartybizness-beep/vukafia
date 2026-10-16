exports.up = async function(knex) {
  const hasUrl = await knex.schema.hasColumn('listings', 'linkedin_url');
  const hasChecked = await knex.schema.hasColumn('listings', 'linkedin_checked_at');
  if (hasUrl && hasChecked) return;

  await knex.schema.alterTable('listings', t => {
    if (!hasUrl) t.string('linkedin_url', 300);
    if (!hasChecked) t.timestamp('linkedin_checked_at');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('listings', t => {
    t.dropColumn('linkedin_url');
    t.dropColumn('linkedin_checked_at');
  });
};
