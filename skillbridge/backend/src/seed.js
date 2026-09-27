// Builds data/db.json from data/seed.json, hashing the demo plaintext
// passwords along the way. Run manually with `npm run seed` any time you
// want to wipe the database back to its original demo state.

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const SEED_PATH = path.join(__dirname, '..', 'data', 'seed.json');
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function buildDb() {
  const seed = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));

  seed.users = seed.users.map((u) => {
    const { password, ...rest } = u;
    return { ...rest, passwordHash: bcrypt.hashSync(password, 10) };
  });

  fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
  return seed;
}

if (require.main === module) {
  buildDb();
  console.log('Seeded backend/data/db.json from seed.json (demo passwords are all "demo123").');
}

module.exports = { buildDb, DB_PATH, SEED_PATH };
