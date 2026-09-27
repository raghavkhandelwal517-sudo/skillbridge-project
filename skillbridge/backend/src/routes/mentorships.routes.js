const express = require('express');
const { state, save, uid } = require('../db');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(authenticate);

router.post('/', (req, res) => {
  const { mentorId } = req.body || {};
  const mentor = state.users.find((u) => u.id === mentorId && u.isMentor);
  if (!mentor) return res.status(404).json({ error: 'Mentor not found or not available for mentorship.' });
  if (mentor.id === req.user.id) return res.status(400).json({ error: 'You cannot request mentorship from yourself.' });

  const existing = state.mentorships.find((m) => m.mentorId === mentor.id && m.menteeId === req.user.id);
  if (existing) return res.status(409).json({ error: 'You already have a mentorship record with this mentor.' });

  const mentorship = {
    id: uid('m'),
    mentorId: mentor.id,
    mentorName: mentor.name,
    menteeId: req.user.id,
    menteeName: req.user.name,
    status: 'pending',
    feedback: '',
    createdAt: Date.now()
  };
  state.mentorships.push(mentorship);
  save();
  res.status(201).json({ mentorship });
});

/* as mentee */
router.get('/mine', (req, res) => {
  res.json({ mentorships: state.mentorships.filter((m) => m.menteeId === req.user.id) });
});

/* as mentor */
router.get('/requests', authorize('academician', 'industry'), (req, res) => {
  res.json({ mentorships: state.mentorships.filter((m) => m.mentorId === req.user.id) });
});

router.put('/:id/status', authorize('academician', 'industry'), (req, res) => {
  const { status } = req.body || {};
  if (!['accepted', 'declined'].includes(status)) return res.status(400).json({ error: 'status must be accepted or declined.' });
  const m = state.mentorships.find((x) => x.id === req.params.id);
  if (!m) return res.status(404).json({ error: 'Mentorship not found.' });
  if (m.mentorId !== req.user.id) return res.status(403).json({ error: 'Not your mentorship request.' });
  m.status = status;
  save();
  res.json({ mentorship: m });
});

router.put('/:id/feedback', authorize('academician', 'industry'), (req, res) => {
  const { feedback } = req.body || {};
  const m = state.mentorships.find((x) => x.id === req.params.id);
  if (!m) return res.status(404).json({ error: 'Mentorship not found.' });
  if (m.mentorId !== req.user.id) return res.status(403).json({ error: 'Not your mentorship request.' });
  m.feedback = feedback ? String(feedback).trim() : '';
  save();
  res.json({ mentorship: m });
});

module.exports = router;
