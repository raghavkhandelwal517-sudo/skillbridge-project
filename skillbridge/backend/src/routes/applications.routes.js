const express = require('express');
const { state, save } = require('../db');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(authenticate);

const STATUSES = ['Applied', 'Shortlisted', 'Selected', 'Rejected'];

router.get('/me', authorize('student'), (req, res) => {
  const mine = state.applications
    .filter((a) => a.userId === req.user.id)
    .map((a) => ({ ...a, opportunity: state.opportunities.find((o) => o.id === a.opportunityId) || null }));
  res.json({ applications: mine });
});

router.put('/:id/status', authorize('industry', 'admin'), (req, res) => {
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'status must be one of: ' + STATUSES.join(', ') });

  const application = state.applications.find((a) => a.id === req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found.' });

  const opp = state.opportunities.find((o) => o.id === application.opportunityId);
  if (req.user.role === 'industry' && (!opp || opp.industryId !== req.user.id)) {
    return res.status(403).json({ error: 'You can only manage applicants for your own postings.' });
  }

  application.status = status;
  save();
  res.json({ application });
});

module.exports = router;
