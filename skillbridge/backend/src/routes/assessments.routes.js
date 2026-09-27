const express = require('express');
const { save } = require('../db');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

const ASSESSMENT_CATS = [
  'programming', 'data', 'communication', 'teamwork',
  'leadership', 'problemsolving', 'adaptability', 'domain'
];

// Categories that translate into an auto-added skill when scored 4+/5.
const CAT_TO_SKILL = {
  programming: 'Problem Solving',
  data: 'Data Analysis',
  communication: 'Communication',
  teamwork: 'Teamwork',
  leadership: 'Leadership',
  problemsolving: 'Problem Solving',
  adaptability: 'Adaptability'
};

router.use(authenticate, authorize('student'));

router.get('/me', (req, res) => {
  res.json({ assessments: req.user.assessments || [] });
});

router.post('/me', (req, res) => {
  const { scores } = req.body || {};
  if (!scores || ASSESSMENT_CATS.some((c) => !Number.isInteger(scores[c]) || scores[c] < 1 || scores[c] > 5)) {
    return res.status(400).json({ error: 'scores must include an integer 1-5 for every category: ' + ASSESSMENT_CATS.join(', ') });
  }

  const user = req.user;
  user.assessments = user.assessments || [];
  const entry = { date: Date.now(), scores };
  user.assessments.push(entry);

  user.skills = user.skills || [];
  ASSESSMENT_CATS.forEach((cat) => {
    const lvl = scores[cat];
    const skillName = CAT_TO_SKILL[cat];
    if (lvl >= 4 && skillName && !user.skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase())) {
      user.skills.push({ name: skillName, level: lvl === 5 ? 'Expert' : 'Advanced' });
    }
  });

  save();
  res.status(201).json({ assessment: entry, skills: user.skills });
});

module.exports = router;
