require('dotenv').config();
const db = require('../db');
const { crawlNews, COUNTRIES } = require('../services/newsCrawler');

(async () => {
  await db.init();
  const codes = process.argv.slice(2).map(c => c.toUpperCase());
  const countries = codes.length ? COUNTRIES.filter(c => codes.includes(c.code)) : COUNTRIES;
  const result = await crawlNews({ countries });
  console.log(result);
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
