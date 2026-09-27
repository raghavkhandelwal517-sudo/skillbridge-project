// Builds the in-memory demo database from data/seed.json.
// The optional persist flag is disabled when Vercel loads the serverless
// function because Vercel's filesystem is read-only and ephemeral.

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const SEED_PATH = path.join(__dirname, '..', 'data', 'seed.json');
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function buildDb(persist = true) {
  const seed = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));

  seed.users = seed.users.map((u) => {
    const { password, ...rest } = u;
    return { ...rest, passwordHash: bcrypt.hashSync(password, 10) };
  });

  if (persist) {
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
  }

  return seed;
}

if (require.main === module) {
  buildDb(true);
  console.log('Seeded backend/data/db.json from seed.json (demo passwords are all "demo123").');
}

module.exports = { buildDb, DB_PATH, SEED_PATH };
