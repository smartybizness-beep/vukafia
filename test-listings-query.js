require('dotenv').config();
const knex = require('knex');

const k = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  }
});

const pageSize = 5;
const offset = 0;

let query = k('listings')
  .where('active', true)
  .select([
    'id', 'type', 'region', 'country', 'country_code', 'flag',
    'state', 'city', 'town', 'name', 'category', 'products_services',
    'description', 'phone', 'whatsapp', 'email', 'website', 'instagram',
    'latitude', 'longitude', 'rating', 'review_count',
    'verified', 'featured', 'is_new', 'cover_photo', 'emoji',
    'view_count', 'contact_count', 'created_at',
  ]);

// Count
query.clone().count('id as total').first()
  .then(result => {
    console.log('Total count:', result.total);
    // Get data
    return query.offset(offset).limit(pageSize).orderBy('featured', 'desc');
  })
  .then(rows => {
    console.log(`Found ${rows.length} listings`);
    if (rows.length > 0) console.log('First listing:', rows[0].name);
  })
  .catch(err => console.error('Error:', err.message))
  .finally(() => process.exit(0));
