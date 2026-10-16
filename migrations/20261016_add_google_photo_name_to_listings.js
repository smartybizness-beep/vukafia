// Store Google photo references instead of key-bearing image URLs; images are served via /photos/:id.
exports.up = async function(knex) {
  if (!(await knex.schema.hasColumn('listings', 'google_photo_name'))) {
    await knex.schema.alterTable('listings', t => {
      t.text('google_photo_name');
    });
  }

  const rows = await knex('listings')
    .where('cover_photo', 'like', '%places.googleapis.com/v1/%/media%')
    .select('id', 'cover_photo');

  for (const row of rows) {
    const match = row.cover_photo.match(/places\.googleapis\.com\/v1\/(places\/[^/]+\/photos\/[^/?]+)\/media/);
    if (!match) continue;
    await knex('listings').where('id', row.id).update({
      google_photo_name: match[1],
      cover_photo: `/photos/${row.id}`,
    });
  }
};

exports.down = async function(knex) {
  await knex.schema.alterTable('listings', t => {
    t.dropColumn('google_photo_name');
  });
};
