require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`SkillBridge server running at http://localhost:${PORT}`);
  console.log('Demo logins (password "demo123"): aditi@student.edu, rohan@university.edu, priya@technova.com, admin@nit.edu');
});
