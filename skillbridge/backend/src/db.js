// A tiny file-backed "database". It keeps everything in memory and writes
// the whole file to disk after every mutation. This is intentionally simple
// so the project runs anywhere with zero native dependencies and no DB
// server to install. For real multi-user deployment, swap this module out
// for a real database (see prisma/schema.prisma for a relational schema
// that mirrors this same shape almost one-to-one).

const fs = require('fs');
const path = require('path');
const { buildDb, DB_PATH } = require('./seed');

function load() {
  if (!fs.existsSync(DB_PATH)) {
    return buildDb();
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

const state = load();

function save() {
  fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2));
}

function uid(prefix) {
  return prefix + '_' + Math.random().toString(36).slice(2, 10);
}

module.exports = { state, save, uid };
