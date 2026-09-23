require('dotenv').config();
const knex = require('knex');

const k = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  }
});

k('listings')
  .where('active', true)
  .limit(5)
  .select('id', 'name', 'city', 'country', 'active', 'verified')
  .then(rows => {
    console.log('Active listings:');
    rows.forEach(r => console.log(`- ${r.name} (${r.active ? 'active' : 'inactive'})`));
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
