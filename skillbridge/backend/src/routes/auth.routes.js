const express = require('express');
const { state, save, uid } = require('../db');
const { hashPassword, comparePassword, signToken } = require('../utils/security');
const { publicUser } = require('../utils/match');
const authenticate = require('../middleware/authenticate');

const router = express.Router();
const VALID_ROLES = ['student', 'academician', 'industry', 'admin'];

router.post('/register', (req, res) => {
  const { name, email, password, role, org } = req.body || {};

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'name, email, password, and role are required.' });
  }
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'role must be one of: ' + VALID_ROLES.join(', ') });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  if (state.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const user = {
    id: uid('u'),
    role,
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    headline: '',
    bio: '',
    isMentor: false,
    skills: [],
    certifications: [],
    achievements: []
  };
  if (role === 'student') {
    user.institution = org || '';
    user.projects = [];
    user.assessments = [];
  }
  if (role === 'academician') {
    user.institution = org || '';
    user.department = '';
  }
  if (role === 'industry') {
    user.orgName = org || '';
    user.sector = '';
  }
  if (role === 'admin') {
    user.institution = org || '';
  }

  state.users.push(user);
  save();

  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password are required.' });

  const user = state.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
  if (!user || !comparePassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
