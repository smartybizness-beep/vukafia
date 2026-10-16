// Usage: npm run make-admin -- person@example.com
require('dotenv').config();
const db = require('../db');

(async () => {
  const email = (process.argv[2] || '').trim().toLowerCase();
  if (!email) {
    console.error('Usage: npm run make-admin -- person@example.com');
    process.exit(1);
  }
  const k = db.query();
  const user = await k('users').whereRaw('lower(email) = ?', [email]).first('id', 'name', 'role');
  if (!user) {
    console.error(`No account with email ${email}. Sign up on the site first, then run this again.`);
    process.exit(1);
  }
  await k('users').where('id', user.id).update({ role: 'admin' });
  console.log(`${user.name} (${email}) is now an admin (was: ${user.role}). Sign in at /admin/reviews.`);
  process.exit(0);
})().catch(err => {
  console.error(err.message);
  process.exit(1);
});
