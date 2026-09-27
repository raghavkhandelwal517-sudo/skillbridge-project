// A tiny file-backed database for local development.
// On Vercel, the filesystem is read-only/ephemeral, so the app falls back to
// a fresh in-memory seed and treats writes as best-effort.

const fs = require('fs');
const { buildDb, DB_PATH } = require('./seed');

function load() {
  if (!fs.existsSync(DB_PATH)) {
    return buildDb(false);
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

const state = load();

function save() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2));
  } catch (err) {
    // Vercel serverless functions cannot persist local files. Keep the
    // current warm instance usable; a real deployment should use a database.
    if (process.env.NODE_ENV !== 'production') throw err;
  }
}

function uid(prefix) {
  return prefix + '_' + Math.random().toString(36).slice(2, 10);
}

module.exports = { state, save, uid };
