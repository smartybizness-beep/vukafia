require('dotenv').config();
const db = require('./db');

async function main() {
  try {
    const k = await db.init();
    
    console.log('Resetting all businesses to be claimable...');
    
    // Set all user_id to null so businesses can be claimed
    await k('listings').where('active', true).update({ user_id: null });
    
    const count = await k('listings').count('id as total').first();
    console.log(`✅ Reset ${count.total} businesses to be claimable`);
    
    // Show a few
    const sample = await k('listings').limit(3);
    console.log('\nSample businesses:');
    sample.forEach((b, i) => {
      console.log(`${i+1}. ${b.name} (${b.country}) - user_id: ${b.user_id}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
