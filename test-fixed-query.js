require('dotenv').config();
const knex = require('knex');

const k = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  }
});

// NEW FIX: Create separate count query
const countResult = k('listings').where('active', true).count('id as total').first();

// Original query for data
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

Promise.all([countResult, query.limit(5).orderBy('featured', 'desc')])
  .then(([count, listings]) => {
    console.log('✅ Count:', count.total);
    console.log('✅ Listings returned:', listings.length);
    if (listings.length > 0) {
      console.log('First listing:', listings[0].name);
    }
  })
  .catch(err => console.error('❌ Error:', err.message))
  .finally(() => process.exit(0));
