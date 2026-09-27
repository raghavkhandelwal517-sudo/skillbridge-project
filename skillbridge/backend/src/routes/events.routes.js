const express = require('express');
const { state, save, uid } = require('../db');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const events = state.events.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  res.json({ events });
});

router.post('/', authorize('academician', 'industry', 'admin'), (req, res) => {
  const { title, type, date, description } = req.body || {};
  if (!title || !date) return res.status(400).json({ error: 'title and date are required.' });
  const event = {
    id: uid('e'),
    title: String(title).trim(),
    type: ['Workshop', 'GuestLecture', 'Challenge'].includes(type) ? type : 'Workshop',
    date,
    description: description ? String(description).trim() : '',
    organizerName: req.user.orgName || req.user.name,
    rsvps: []
  };
  state.events.push(event);
  save();
  res.status(201).json({ event });
});

router.post('/:id/rsvp', (req, res) => {
  const event = state.events.find((e) => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found.' });
  event.rsvps = event.rsvps || [];
  const idx = event.rsvps.indexOf(req.user.id);
  if (idx > -1) event.rsvps.splice(idx, 1);
  else event.rsvps.push(req.user.id);
  save();
  res.json({ event });
});

module.exports = router;
