const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const assessmentsRoutes = require('./routes/assessments.routes');
const opportunitiesRoutes = require('./routes/opportunities.routes');
const applicationsRoutes = require('./routes/applications.routes');
const programsRoutes = require('./routes/programs.routes');
const mentorshipsRoutes = require('./routes/mentorships.routes');
const eventsRoutes = require('./routes/events.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/programs', programsRoutes);
app.use('/api/mentorships', mentorshipsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// The deployed frontend lives in docs/. Keep the path relative to this file
// so it works both locally and in Vercel's bundled function.
const FRONTEND_DIR = path.join(__dirname, '..', '..', 'docs');
app.use(express.static(FRONTEND_DIR));

// Return the SPA entry point for browser navigation and unknown frontend paths,
// but never hide an unknown API endpoint behind index.html.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

module.exports = app;
