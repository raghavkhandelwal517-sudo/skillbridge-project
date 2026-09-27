const express = require('express');
const { state, save, uid } = require('../db');
const { computeMatch, publicUser } = require('../utils/match');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(authenticate);

function withMatch(opp, req) {
  if (req.user.role !== 'student') return { ...opp, applicantCount: applicantsCount(opp.id) };
  const myApp = state.applications.find((a) => a.opportunityId === opp.id && a.userId === req.user.id);
  return {
    ...opp,
    match: computeMatch(req.user, opp.requiredSkills),
    applicantCount: applicantsCount(opp.id),
    myStatus: myApp ? myApp.status : null
  };
}
function applicantsCount(oppId) {
  return state.applications.filter((a) => a.opportunityId === oppId).length;
}

/* list + filter (any authenticated role can browse) */
router.get('/', (req, res) => {
  const { q, type } = req.query;
  let list = state.opportunities;
  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter((o) => o.title.toLowerCase().includes(needle) || o.industryName.toLowerCase().includes(needle));
  }
  if (type) list = list.filter((o) => o.type === type);
  res.json({ opportunities: list.map((o) => withMatch(o, req)) });
});

/* industry: own postings */
router.get('/mine', authorize('industry'), (req, res) => {
  const mine = state.opportunities.filter((o) => o.industryId === req.user.id).map((o) => withMatch(o, req));
  res.json({ opportunities: mine });
});

router.post('/', authorize('industry'), (req, res) => {
  const { title, type, description, requiredSkills, deadline } = req.body || {};
  if (!title || !description || !deadline) {
    return res.status(400).json({ error: 'title, description, and deadline are required.' });
  }
  const opp = {
    id: uid('o'),
    industryId: req.user.id,
    industryName: req.user.orgName || req.user.name,
    title: String(title).trim(),
    type: ['Internship', 'Job', 'Training'].includes(type) ? type : 'Internship',
    description: String(description).trim(),
    requiredSkills: Array.isArray(requiredSkills)
      ? requiredSkills
      : String(requiredSkills || '').split(',').map((s) => s.trim()).filter(Boolean),
    deadline,
    createdAt: Date.now()
  };
  state.opportunities.push(opp);
  save();
  res.status(201).json({ opportunity: opp });
});

router.delete('/:id', authorize('industry', 'admin'), (req, res) => {
  const opp = state.opportunities.find((o) => o.id === req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found.' });
  if (req.user.role === 'industry' && opp.industryId !== req.user.id) {
    return res.status(403).json({ error: 'You can only delete your own postings.' });
  }
  state.opportunities = state.opportunities.filter((o) => o.id !== req.params.id);
  state.applications = state.applications.filter((a) => a.opportunityId !== req.params.id);
  save();
  res.status(204).end();
});

/* student: apply */
router.post('/:id/apply', authorize('student'), (req, res) => {
  const opp = state.opportunities.find((o) => o.id === req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found.' });
  const existing = state.applications.find((a) => a.opportunityId === opp.id && a.userId === req.user.id);
  if (existing) return res.status(409).json({ error: 'You already applied to this opportunity.' });

  const application = { id: uid('a'), opportunityId: opp.id, userId: req.user.id, status: 'Applied', date: Date.now() };
  state.applications.push(application);
  save();
  res.status(201).json({ application });
});

/* industry/admin: applicants for one opportunity */
router.get('/:id/applicants', authorize('industry', 'admin'), (req, res) => {
  const opp = state.opportunities.find((o) => o.id === req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found.' });
  if (req.user.role === 'industry' && opp.industryId !== req.user.id) {
    return res.status(403).json({ error: 'You can only view applicants for your own postings.' });
  }
  const apps = state.applications
    .filter((a) => a.opportunityId === opp.id)
    .map((a) => {
      const student = state.users.find((u) => u.id === a.userId);
      return {
        ...a,
        student: student ? publicUser(student) : null,
        match: student ? computeMatch(student, opp.requiredSkills) : 0
      };
    });
  res.json({ opportunity: opp, applicants: apps });
});

/* industry suggested-candidates helper (used on the industry dashboard) */
router.get('/:id/suggested', authorize('industry', 'admin'), (req, res) => {
  const opp = state.opportunities.find((o) => o.id === req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found.' });
  const already = new Set(state.applications.filter((a) => a.opportunityId === opp.id).map((a) => a.userId));
  const candidates = state.users
    .filter((u) => u.role === 'student' && !already.has(u.id))
    .map((s) => ({ student: publicUser(s), match: computeMatch(s, opp.requiredSkills) }))
    .filter((c) => c.match > 0)
    .sort((a, b) => b.match - a.match)
    .slice(0, 5);
  res.json({ candidates });
});

module.exports = router;
