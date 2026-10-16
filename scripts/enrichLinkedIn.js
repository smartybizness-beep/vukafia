require('dotenv').config();
const db = require('../db');
const { enrichLinkedIn } = require('../services/linkedinEnricher');

(async () => {
  await db.init();
  const limit = parseInt(process.argv[2], 10) || undefined;
  await enrichLinkedIn({ limit });
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
