const express = require('express');
const { state } = require('../db');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(authenticate, authorize('admin'));

function countByRole(role) {
  return state.users.filter((u) => u.role === role).length;
}

router.get('/summary', (req, res) => {
  const applied = state.applications.length;
  const shortlisted = state.applications.filter((a) => a.status === 'Shortlisted' || a.status === 'Selected').length;
  const selected = state.applications.filter((a) => a.status === 'Selected').length;

  res.json({
    students: countByRole('student'),
    academicians: countByRole('academician'),
    industries: countByRole('industry'),
    opportunities: state.opportunities.length,
    funnel: { applied, shortlisted, selected },
    applicationsByStatus: state.applications.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {})
  });
});

function frequency(list) {
  return Object.entries(
    list.reduce((acc, name) => {
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

router.get('/skills', (req, res) => {
  const demand = frequency(state.opportunities.flatMap((o) => o.requiredSkills || []));
  const supply = frequency(
    state.users.filter((u) => u.role === 'student').flatMap((u) => (u.skills || []).map((s) => s.name))
  );
  res.json({ demand, supply });
});

module.exports = router;
