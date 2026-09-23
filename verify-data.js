require('dotenv').config();
const knex = require('knex');

const k = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  }
});

k('listings').count('id as count').first()
  .then(result => {
    console.log('✅ Total listings in database:', result.count);
    if (result.count > 0) {
      return k('listings').limit(1).select('name', 'city', 'country').first();
    }
  })
  .then(listing => {
    if (listing) console.log('✅ Sample:', listing.name, 'in', listing.city, listing.country);
  })
  .catch(err => console.error('❌ Error:', err.message))
  .finally(() => process.exit(0));
