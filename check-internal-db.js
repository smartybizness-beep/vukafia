// Test using the INTERNAL Railway address (what the API uses)
const knex = require('knex');

const k = knex({
  client: 'pg',
  connection: {
    host: 'postgres.railway.internal',
    port: 5432,
    user: 'postgres',
    password: 'sAbPhLWlWEUGSXQDLNNYuPJQIrLDqiOr',
    database: 'railway',
    ssl: { rejectUnauthorized: false }
  }
});

k('listings').count('id as count').first()
  .then(result => {
    console.log('Listings in INTERNAL database:', result?.count || 0);
  })
  .catch(err => console.error('❌ Error:', err.message))
  .finally(() => process.exit(0));
