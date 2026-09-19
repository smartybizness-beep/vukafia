/**
 * knexfile.js — used by the knex CLI (`npx knex migrate:make|latest|rollback`).
 * The running app builds its own connection in db.js and applies the same
 * migrations directory on startup.
 *
 * Dev:  SQLite  (data/vukafia.sqlite)
 * Prod: PostgreSQL (DATABASE_URL)
 */

require('dotenv').config();
const path = require('path');

const migrations = { directory: path.join(__dirname, 'migrations') };

module.exports = {
  development: {
    client: 'sqlite3',
    connection: { filename: path.join(__dirname, 'data', 'vukafia.sqlite') },
    useNullAsDefault: true,
    migrations,
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations,
  },
};
