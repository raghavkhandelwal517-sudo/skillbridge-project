const express = require('express');
const { state, save, uid } = require('../db');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(authenticate);

router.get('/', (req, res) => {
  res.json({ programs: state.programs });
});

router.post('/', authorize('academician'), (req, res) => {
  const { title, type, description, eligibility, startDate, endDate } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required.' });
  const program = {
    id: uid('pr'),
    academicianId: req.user.id,
    academicianName: req.user.name,
    title: String(title).trim(),
    type: ['FDP', 'Internship', 'Consultancy', 'Collaborative Project'].includes(type) ? type : 'FDP',
    description: description ? String(description).trim() : '',
    eligibility: eligibility ? String(eligibility).trim() : '',
    startDate: startDate || '',
    endDate: endDate || '',
    interested: []
  };
  state.programs.push(program);
  save();
  res.status(201).json({ program });
});

router.delete('/:id', authorize('academician'), (req, res) => {
  const program = state.programs.find((p) => p.id === req.params.id);
  if (!program) return res.status(404).json({ error: 'Program not found.' });
  if (program.academicianId !== req.user.id) return res.status(403).json({ error: 'You can only delete your own programs.' });
  state.programs = state.programs.filter((p) => p.id !== req.params.id);
  save();
  res.status(204).end();
});

router.post('/:id/interest', (req, res) => {
  const program = state.programs.find((p) => p.id === req.params.id);
  if (!program) return res.status(404).json({ error: 'Program not found.' });
  program.interested = program.interested || [];
  const idx = program.interested.indexOf(req.user.id);
  if (idx > -1) program.interested.splice(idx, 1);
  else program.interested.push(req.user.id);
  save();
  res.json({ program });
});

module.exports = router;
