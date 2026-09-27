const express = require('express');
const { state, save, uid } = require('../db');
const { publicUser } = require('../utils/match');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

router.use(authenticate);

/* ---------- own profile ---------- */

router.get('/me', (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.put('/me', (req, res) => {
  const user = req.user;
  const { name, headline, bio, org, sector, department } = req.body || {};
  if (name) user.name = String(name).trim();
  if (headline !== undefined) user.headline = String(headline).trim();
  if (bio !== undefined) user.bio = String(bio).trim();
  if (org !== undefined) {
    if (user.role === 'industry') user.orgName = String(org).trim();
    else user.institution = String(org).trim();
  }
  if (user.role === 'industry' && sector !== undefined) user.sector = String(sector).trim();
  if (user.role === 'academician' && department !== undefined) user.department = String(department).trim();

  save();
  res.json({ user: publicUser(user) });
});

router.put('/me/mentor', authorize('academician', 'industry'), (req, res) => {
  req.user.isMentor = !req.user.isMentor;
  save();
  res.json({ user: publicUser(req.user) });
});

/* ---------- skills ---------- */

router.post('/me/skills', (req, res) => {
  const { name, level } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required.' });
  const lvl = SKILL_LEVELS.includes(level) ? level : 'Intermediate';
  const user = req.user;
  user.skills = user.skills || [];
  if (user.skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
    return res.status(409).json({ error: 'You already have that skill.' });
  }
  user.skills.push({ name: String(name).trim(), level: lvl });
  save();
  res.status(201).json({ skills: user.skills });
});

router.delete('/me/skills/:name', (req, res) => {
  const user = req.user;
  user.skills = (user.skills || []).filter((s) => s.name.toLowerCase() !== req.params.name.toLowerCase());
  save();
  res.json({ skills: user.skills });
});

/* ---------- projects (students) ---------- */

router.post('/me/projects', authorize('student'), (req, res) => {
  const { title, description, tech, status, link } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required.' });
  const project = {
    id: uid('p'),
    title: String(title).trim(),
    description: description ? String(description).trim() : '',
    tech: Array.isArray(tech) ? tech : String(tech || '').split(',').map((t) => t.trim()).filter(Boolean),
    status: status === 'Completed' ? 'Completed' : 'Ongoing',
    link: link ? String(link).trim() : ''
  };
  req.user.projects = req.user.projects || [];
  req.user.projects.push(project);
  save();
  res.status(201).json({ projects: req.user.projects });
});

router.delete('/me/projects/:id', authorize('student'), (req, res) => {
  req.user.projects = (req.user.projects || []).filter((p) => p.id !== req.params.id);
  save();
  res.json({ projects: req.user.projects });
});

/* ---------- certifications / achievements (portfolio) ---------- */

function listField(field) {
  return function (req, res) {
    const { item } = req.body || {};
    if (!item) return res.status(400).json({ error: 'item is required.' });
    req.user[field] = req.user[field] || [];
    req.user[field].push(String(item).trim());
    save();
    res.status(201).json({ [field]: req.user[field] });
  };
}
function removeFromList(field) {
  return function (req, res) {
    const idx = Number(req.params.index);
    req.user[field] = req.user[field] || [];
    if (Number.isInteger(idx) && idx >= 0 && idx < req.user[field].length) {
      req.user[field].splice(idx, 1);
      save();
    }
    res.json({ [field]: req.user[field] });
  };
}

router.post('/me/certifications', listField('certifications'));
router.delete('/me/certifications/:index', removeFromList('certifications'));
router.post('/me/achievements', listField('achievements'));
router.delete('/me/achievements/:index', removeFromList('achievements'));

/* ---------- mentors directory ---------- */

router.get('/mentors', (req, res) => {
  const mentors = state.users
    .filter((u) => u.isMentor && u.id !== req.user.id)
    .map(publicUser);
  res.json({ mentors });
});

/* ---------- admin: list + export users ---------- */

router.get('/', authorize('admin'), (req, res) => {
  const { role, q } = req.query;
  let list = state.users;
  if (role) list = list.filter((u) => u.role === role);
  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter((u) => u.name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle));
  }
  res.json({ users: list.map(publicUser) });
});

router.get('/export.csv', authorize('admin'), (req, res) => {
  const esc = (v) => {
    v = v === undefined || v === null ? '' : String(v);
    return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  };
  const header = ['Name', 'Email', 'Role', 'Institution/Org'];
  const lines = [header.join(',')];
  state.users.forEach((u) => {
    lines.push([esc(u.name), esc(u.email), esc(u.role), esc(u.orgName || u.institution || '')].join(','));
  });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="skillbridge-users.csv"');
  res.send(lines.join('\n'));
});

module.exports = router;
