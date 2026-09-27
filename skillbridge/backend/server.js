require('dotenv').config();

const app = require('./src/app');

const PORT = process.env.PORT || 4000;

// Only start the server if this file is run directly (local development)
// When deployed to Vercel, the app is exported as a module, not started here
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SkillBridge server running at http://localhost:${PORT}`);
    console.log(
      'Demo logins (password "demo123"): aditi@student.edu, rohan@university.edu, priya@technova.com, admin@nit.edu'
    );
  });
}

module.exports = app;
