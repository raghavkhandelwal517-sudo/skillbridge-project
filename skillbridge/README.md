# SkillBridge — Academia-Industry Collaboration Portal

A full-stack starter implementation of the Academia-Industry Collaboration
Portal: students, academicians, industry representatives, and an institution
admin, connected through skill profiles, opportunities, mentorship, programs,
and events.

This is a working reference implementation, not a finished production
system — see [Honest limitations](#honest-limitations-and-next-steps) before
you rely on it for anything real.

## What's here

```
skillbridge/
├── backend/           Node.js + Express REST API and static file server
│   ├── server.js
│   ├── data/
│   │   └── seed.json      demo data (4 accounts, opportunities, etc.)
│   └── src/
│       ├── app.js         wires up all routes + serves the frontend
│       ├── db.js          tiny JSON-file "database" (see note below)
│       ├── seed.js        (re)builds data/db.json from seed.json
│       ├── middleware/    authenticate.js (JWT), authorize.js (RBAC)
│       ├── utils/         password hashing, JWT signing, skill matching
│       └── routes/        one file per resource (auth, users, opportunities...)
├── frontend/          Plain HTML/CSS/JS single-page app (no build step)
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── api.js         fetch wrapper that talks to the backend
│       └── app.js         all views, rendering, and event handlers
└── prisma/
    └── schema.prisma  reference relational schema (see note below)
```

## Quick start

Requires Node.js 18+.

```bash
cd backend
npm install
cp .env.example .env      # optional — sensible defaults are already set
npm start
```

Then open **http://localhost:4000** — the backend serves the frontend
directly, so there's nothing else to run or configure.

Demo logins (password for all of them is `demo123`), or just use the
one-click demo buttons on the login screen:

| Role       | Email                  |
|------------|-------------------------|
| Student    | aditi@student.edu       |
| Academician| rohan@university.edu    |
| Industry   | priya@technova.com      |
| Admin      | admin@nit.edu           |

To wipe the database back to this demo state at any time:

```bash
npm run seed
```

## What's implemented

- **Auth & RBAC** — JWT-based login/signup, four roles, route-level
  authorization middleware (`backend/src/middleware/authorize.js`)
- **Skill profiles** — add/remove skills with proficiency levels, an
  8-category self-assessment that auto-suggests skills from strong scores
- **Matching engine** — every opportunity gets a live % skill-match score
  for the logged-in student; industry users see suggested candidates for
  their own postings
- **Opportunities** — industries post internships/jobs/training; students
  browse, filter, and apply; industries track applicants and change status
  (Applied → Shortlisted → Selected/Rejected)
- **Academician programs** — FDPs, industrial training, consultancy,
  collaborative projects, with an "I'm interested" flow
- **Mentorship** — students request mentors (academicians or industry reps
  who opt in); mentors accept/decline and leave feedback
- **Events** — workshops, guest lectures, challenges, with RSVPs
- **Digital portfolio** — auto-built from a student's skills, projects,
  certifications, achievements, and application history
- **Admin dashboards** — user directory with search/filter, opportunity
  overview, placement funnel, and skill demand vs. supply analytics

## Honest limitations and next steps

This was generated to be a genuinely useful *starting point*, not a
finished product. Before treating it as production-ready:

- **The "database" is a JSON file** (`backend/data/db.json`), loaded into
  memory and rewritten on every change. It's simple and dependency-free,
  which makes the project easy to run anywhere, but it will not scale past
  light demo/prototype use, and concurrent writes aren't transaction-safe.
  `prisma/schema.prisma` is a ready-to-adopt relational schema that mirrors
  this same data shape — see the comment at the top of that file for the
  migration steps.
- **JWTs are stored in `localStorage`**, which is fine for a demo but is
  more exposed to XSS than an httpOnly cookie. A real deployment should
  move to httpOnly cookies with CSRF protection, refresh tokens, and
  shorter access-token lifetimes.
- **No email verification, password reset, or MFA** yet, despite MFA being
  listed as optional in the original spec.
- **No file uploads** — the "Documents" concept from the original schema
  (resumes, certificates, verification workflow) isn't implemented; the
  Prisma schema includes a `Document` model as a starting point.
- **No pagination** on list endpoints — fine at demo scale, not at real
  scale.
- **No automated tests.** Routes were manually reviewed and syntax-checked,
  but there's no test suite included yet.
- **No real-time features** (WebSockets) — application status changes and
  new opportunities require a page refresh to see.

## Architecture notes

- The frontend is intentionally framework-free (no React/build step) so
  the whole project runs with a single `npm install`. `frontend/js/app.js`
  re-renders the relevant section of the page after each action rather than
  doing a full page reload.
- The backend follows a conventional Express layout: `routes/` → thin
  HTTP handlers, `middleware/` → auth/RBAC, `utils/` → pure helper
  functions, `db.js` → the only place that touches the data file.
- CORS is enabled and the API is fully separable from the frontend if you
  want to deploy them independently later — just point `BASE_URL` in
  `frontend/js/api.js` at your API's origin.
