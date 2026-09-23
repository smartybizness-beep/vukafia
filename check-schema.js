require('dotenv').config();
const knex = require('knex');

const k = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  }
});

// Check tables
k.raw("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
  .then(result => {
    console.log('Tables:', result.rows.map(r => r.table_name));
    return k('listings').where('active', true).limit(1).select('id', 'name', 'active', 'verified', 'verified_source');
  })
  .then(rows => {
    console.log('Sample active listing:', rows[0] || 'NONE FOUND');
    return k('listings').limit(1).select('id', 'name', 'active', 'verified', 'verified_source');
  })
  .then(rows => {
    console.log('Sample ANY listing:', rows[0] || 'NONE FOUND');
  })
  .catch(err => console.error('Error:', err.message))
  .finally(() => process.exit(0));
