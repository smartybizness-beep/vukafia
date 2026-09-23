require('dotenv').config();
const knex = require('knex');

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const k = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  }
});

k.raw('SELECT 1')
  .then(() => {
    console.log('✅ Connection successful!');
    return k('listings').count('id as count').first();
  })
  .then(result => {
    console.log('Total listings:', result.count);
  })
  .catch(err => console.error('❌ Error:', err.message))
  .finally(() => process.exit(0));
