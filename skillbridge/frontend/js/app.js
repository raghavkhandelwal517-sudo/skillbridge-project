/* =========================================================
   CONSTANTS (UI-only; all real data comes from the API)
========================================================= */
var MASTER_SKILLS = [
  "JavaScript","Python","Java","React","Node.js","SQL","Machine Learning","Data Analysis",
  "Cloud Computing (AWS)","Cybersecurity","UI/UX Design","DevOps","Mobile Development","C++",
  "Git & Version Control","REST APIs","TensorFlow","Excel","Power BI","Networking",
  "Communication","Teamwork","Leadership","Problem Solving","Critical Thinking","Time Management",
  "Adaptability","Creativity","Public Speaking","Negotiation","Emotional Intelligence",
  "Conflict Resolution","Project Management","Work Ethic","Attention to Detail","Mentoring"
];
var SKILL_LEVELS = ["Beginner","Intermediate","Advanced","Expert"];
var LEVEL_WIDTH = { Beginner:25, Intermediate:50, Advanced:75, Expert:100 };

var ASSESSMENT_CATS = [
  {id:"programming", label:"Programming & Technical Skills", desc:"Coding, tools, and technical execution."},
  {id:"data", label:"Data & Analytical Thinking", desc:"Working with data, spreadsheets, and drawing conclusions."},
  {id:"communication", label:"Communication", desc:"Writing, speaking, and explaining ideas clearly."},
  {id:"teamwork", label:"Teamwork & Collaboration", desc:"Working well with others toward a shared goal."},
  {id:"leadership", label:"Leadership", desc:"Guiding, motivating, and taking ownership."},
  {id:"problemsolving", label:"Problem Solving", desc:"Breaking down problems and finding solutions."},
  {id:"adaptability", label:"Adaptability", desc:"Handling change and ambiguity."},
  {id:"domain", label:"Domain Knowledge", desc:"Depth of knowledge in your field of study."}
];
var ASSESSMENT_LEVEL_LABELS = ["Beginner","Novice","Intermediate","Advanced","Expert"];

var NAV = {
  student: [
    ["dashboard","Dashboard","🏠"],["profile","My Profile","👤"],["skills","Skills","🧩"],
    ["assessment","Skill Assessment","📝"],["projects","Projects","💼"],
    ["opportunities","Opportunities","🚀"],["mentorship","Mentorship","🤝"],
    ["events","Events","📅"],["portfolio","Portfolio","📁"]
  ],
  academician: [
    ["dashboard","Dashboard","🏠"],["profile","My Profile","👤"],["programs","Programs","🎓"],
    ["mentorship","Mentorship","🤝"],["events","Events","📅"]
  ],
  industry: [
    ["dashboard","Dashboard","🏠"],["profile","My Profile","👤"],["opportunities","Opportunities","📢"],
    ["applicants","Applicants","📋"],["mentorship","Mentorship","🤝"],["events","Events","📅"]
  ],
  admin: [
    ["dashboard","Dashboard","🏠"],["users","Users","👥"],["opportunities","Opportunities","📢"],
    ["analytics","Analytics","📊"],["events","Events","📅"]
  ]
};
var ROLE_LABEL = { student:"Student", academician:"Academician", industry:"Industry Representative", admin:"Institution Admin" };

/* =========================================================
   STATE
========================================================= */
var session = { user: null, view: 'dashboard' };
var ui = {
  profileMenuOpen:false, authTab:'login', authError:'',
  oppSearch:'', oppTypeFilter:'', selectedOpportunityForApplicants:'all',
  userSearch:'', userRoleFilter:'', assessmentDraft:{}, feedbackOpenFor:null
};

/* =========================================================
   UTIL
========================================================= */
function escapeHtml(str){
  return (str===undefined||str===null?'':String(str)).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
function initials(name){
  if(!name) return '?';
  var parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts.length>1?parts[parts.length-1][0]:'')).toUpperCase();
}
function fmtDate(d){
  if(!d) return '—';
  try{ var dt = new Date(d+'T00:00:00'); return dt.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}); }catch(e){ return d; }
}
function matchClass(pct){ return pct>=70 ? 'high' : (pct>=40 ? 'mid' : 'low'); }
function showToast(msg){
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(function(){ t.classList.remove('show'); }, 2600);
}
function statCard(icon, num, label){
  return '<div class="stat-card"><span>' + icon + '</span><h3>' + num + '</h3><p>' + label + '</p></div>';
}
function statCardStar(num, label){
  return '<div class="stat-card stat-card-star">' +
    '<div class="stat-star-icon">★</div>' +
    '<div><h3>' + num + '</h3><p>' + label + '</p></div>' +
  '</div>';
}

/* =========================================================
   TELEMETRY VISUALIZATIONS (From Reference Specifications)
========================================================= */

function renderPerformanceTelemetry(opts){
  opts = opts || {};
  var title = opts.title || 'Performance & Activity Analytics';
  var subtitle = opts.subtitle || 'Real-time telemetry styled with Neon Spring Green & Sky Blue telemetry visuals.';
  var id = opts.id || 'telemetry_' + Math.random().toString(36).slice(2, 7);

  var hours = opts.hours || '3 h 45 m';
  var hoursLabel = opts.hoursLabel || 'Active engineering hours';
  var remaining = opts.remaining || '4 h 15 m';
  var goal = opts.goal || 'Weekly Goal: 20 h';
  var verifications = opts.verifications || '84 Skill Verifications';
  var subDesc = opts.subDesc || 'Active challenges passed';

  return '' +
  '<div class="telemetry-section">' +
    '<div class="telemetry-header">' +
      '<h2 class="telemetry-title">' + escapeHtml(title) + '</h2>' +
      '<p class="telemetry-subtitle">' + escapeHtml(subtitle) + '</p>' +
    '</div>' +
    '<div class="telemetry-grid-3">' +
      // Card 1: Skill Learning Focus
      '<div class="telemetry-card">' +
        '<div class="telemetry-card-head">' +
          '<h3>' + escapeHtml(opts.card1Title || 'Skill Learning Focus') + '</h3>' +
          '<span class="telemetry-badge-green">TODAY</span>' +
        '</div>' +
        '<div class="telemetry-stat-row">' +
          '<div>' +
            '<div class="telemetry-big-stat">' + escapeHtml(hours) + '</div>' +
            '<div class="telemetry-stat-label">' + escapeHtml(hoursLabel) + '</div>' +
          '</div>' +
          '<div class="telemetry-donut-wrap">' +
            '<svg width="84" height="84" viewBox="0 0 84 84">' +
              '<defs>' +
                '<linearGradient id="donutGrad_' + id + '" x1="0%" y1="100%" x2="100%" y2="0%">' +
                  '<stop offset="0%" stop-color="#00f5a0"/>' +
                  '<stop offset="50%" stop-color="#06b6d4"/>' +
                  '<stop offset="100%" stop-color="#38bdf8"/>' +
                '</linearGradient>' +
              '</defs>' +
              '<circle cx="42" cy="42" r="32" fill="none" stroke="#f1f5f9" stroke-width="9"/>' +
              '<circle cx="42" cy="42" r="32" fill="none" stroke="url(#donutGrad_' + id + ')" stroke-width="9" stroke-linecap="round" stroke-dasharray="152 202" transform="rotate(-90 42 42)"/>' +
            '</svg>' +
          '</div>' +
        '</div>' +
        '<div class="telemetry-breakdown-list">' +
          '<div class="telemetry-breakdown-item">' +
            '<div class="telemetry-breakdown-left"><span class="telemetry-dot cyan"></span><span>Frontend Architecture</span></div>' +
            '<span class="telemetry-breakdown-val">1h 50 m</span>' +
          '</div>' +
          '<div class="telemetry-breakdown-item">' +
            '<div class="telemetry-breakdown-left"><span class="telemetry-dot blue"></span><span>Algorithms & Data Structures</span></div>' +
            '<span class="telemetry-breakdown-val">1h 15 m</span>' +
          '</div>' +
          '<div class="telemetry-breakdown-item">' +
            '<div class="telemetry-breakdown-left"><span class="telemetry-dot mint"></span><span>System Design & Review</span></div>' +
            '<span class="telemetry-breakdown-val">40 m</span>' +
          '</div>' +
        '</div>' +
        '<div class="telemetry-mini-cards">' +
          '<div class="telemetry-mini-card"><span class="t-icon">💻</span><span class="t-label">Code</span><span class="t-time">1h 50m</span></div>' +
          '<div class="telemetry-mini-card"><span class="t-icon">📐</span><span class="t-label">Design</span><span class="t-time">1h 15m</span></div>' +
          '<div class="telemetry-mini-card"><span class="t-icon">🤝</span><span class="t-label">Mentorship</span><span class="t-time">40m</span></div>' +
        '</div>' +
      '</div>' +

      // Card 2: Weekly Mastery Target
      '<div class="telemetry-card">' +
        '<div class="telemetry-card-head">' +
          '<h3>' + escapeHtml(opts.card2Title || 'Weekly Mastery Target') + '</h3>' +
          '<span class="telemetry-badge-green">ON TRACK</span>' +
        '</div>' +
        '<div class="gauge-container">' +
          '<div class="gauge-svg-wrap">' +
            '<svg width="200" height="110" viewBox="0 0 200 110">' +
              '<defs>' +
                '<linearGradient id="gaugeGrad_' + id + '" x1="0%" y1="0%" x2="100%" y2="0%">' +
                  '<stop offset="0%" stop-color="#10b981"/>' +
                  '<stop offset="50%" stop-color="#06b6d4"/>' +
                  '<stop offset="100%" stop-color="#0ea5e9"/>' +
                '</linearGradient>' +
              '</defs>' +
              '<path d="M 32 95 A 68 68 0 0 1 168 95" fill="none" stroke="#f1f5f9" stroke-width="11" stroke-linecap="round"/>' +
              '<path d="M 32 95 A 68 68 0 0 1 168 95" fill="none" stroke="url(#gaugeGrad_' + id + ')" stroke-width="11" stroke-linecap="round" stroke-dasharray="168 215"/>' +
            '</svg>' +
            '<div class="gauge-center-content">' +
              '<div class="gauge-center-val">' + escapeHtml(remaining) + '</div>' +
              '<div class="gauge-center-sub">Remaining this sprint</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="telemetry-goal-pill">' + escapeHtml(goal) + '</div>' +
      '</div>' +

      // Card 3: Sprint Productivity
      '<div class="telemetry-card">' +
        '<div class="telemetry-card-head">' +
          '<h3>' + escapeHtml(opts.card3Title || 'Sprint Productivity') + '</h3>' +
          '<span class="telemetry-badge-green">WEEK 39</span>' +
        '</div>' +
        '<div class="telemetry-dates-bar">' +
          '<span class="telemetry-date-pill">10</span>' +
          '<span class="telemetry-date-pill">11</span>' +
          '<span class="telemetry-date-pill">12</span>' +
          '<span class="telemetry-date-pill">13</span>' +
          '<span class="telemetry-date-pill active">14</span>' +
          '<span class="telemetry-date-pill">15</span>' +
          '<span class="telemetry-date-pill">16</span>' +
        '</div>' +
        '<div class="telemetry-barchart">' +
          '<div class="telemetry-bar-col"><div class="telemetry-bar-wrap"><div class="telemetry-bar-fill" style="height:38%;"></div></div><span class="telemetry-bar-day">S</span></div>' +
          '<div class="telemetry-bar-col"><div class="telemetry-bar-wrap"><div class="telemetry-bar-fill" style="height:76%;"></div></div><span class="telemetry-bar-day">M</span></div>' +
          '<div class="telemetry-bar-col"><div class="telemetry-bar-wrap"><div class="telemetry-bar-fill" style="height:64%;"></div></div><span class="telemetry-bar-day">T</span></div>' +
          '<div class="telemetry-bar-col"><div class="telemetry-bar-wrap"><div class="telemetry-bar-fill" style="height:92%;"></div></div><span class="telemetry-bar-day">W</span></div>' +
          '<div class="telemetry-bar-col"><div class="telemetry-bar-wrap"><div class="telemetry-bar-fill" style="height:84%;"></div></div><span class="telemetry-bar-day">T</span></div>' +
          '<div class="telemetry-bar-col"><div class="telemetry-bar-wrap"><div class="telemetry-bar-fill" style="height:46%;"></div></div><span class="telemetry-bar-day">F</span></div>' +
          '<div class="telemetry-bar-col"><div class="telemetry-bar-wrap"><div class="telemetry-bar-fill" style="height:60%;"></div></div><span class="telemetry-bar-day">S</span></div>' +
        '</div>' +
        '<div class="telemetry-subcard">' +
          '<div>' +
            '<div class="telemetry-subcard-title">' + escapeHtml(verifications) + '</div>' +
            '<div class="telemetry-subcard-desc">' + escapeHtml(subDesc) + '</div>' +
          '</div>' +
          '<div class="telemetry-sparkline"><span></span><span></span><span></span><span></span></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function renderEngagementMatrix(opts){
  opts = opts || {};
  var title = opts.title || 'Platform Student Engagement Matrix';
  var subtitle = opts.subtitle || 'Weekly hourly activity distribution';
  var badge = opts.badge || 'PEAK: 2 PM - 6 PM';

  var days = ['S','M','T','W','T','F','S'];
  var matrixData = [
    [0,0,0,0,0,0,0,1,1,1,2,2,3,3,3,4,4,4,3,2,1,1,0,0],
    [0,0,0,0,0,0,1,2,3,3,4,4,4,5,5,5,5,4,3,3,2,1,1,0],
    [0,0,0,0,0,0,1,2,3,4,4,4,5,5,5,5,4,4,3,2,2,1,0,0],
    [0,0,0,0,0,0,1,2,3,3,4,5,5,5,5,5,5,4,3,3,2,1,1,0],
    [0,0,0,0,0,0,1,2,3,4,4,5,5,5,5,5,4,4,3,3,2,1,0,0],
    [0,0,0,0,0,0,1,2,2,3,3,4,4,4,4,3,3,2,2,1,1,0,0,0],
    [0,0,0,0,0,0,0,0,1,1,2,2,3,4,4,4,3,3,2,2,1,0,0,0]
  ];

  var rowsHtml = days.map(function(d, dIdx){
    var cells = matrixData[dIdx].map(function(lvl, h){
      var timeStr = (h < 10 ? '0' : '') + h + ':00';
      var levelDesc = lvl===5 ? 'Peak Flow (45-60m)' : (lvl===4 ? '45-60m' : (lvl===3 ? '30-45m' : (lvl===2 ? '15-30m' : (lvl===1 ? '0-15m' : 'Inactive'))));
      return '<div class="matrix-cell lvl-' + lvl + '" title="' + d + ' at ' + timeStr + ' · ' + levelDesc + '"></div>';
    }).join('');
    return '<div class="matrix-row"><span class="matrix-day-label">' + d + '</span><div class="matrix-slots">' + cells + '</div></div>';
  }).join('');

  return '' +
  '<div class="matrix-card">' +
    '<div class="matrix-head">' +
      '<div>' +
        '<h2>' + escapeHtml(title) + '</h2>' +
        '<p>' + escapeHtml(subtitle) + '</p>' +
      '</div>' +
      '<span class="telemetry-badge-green">' + escapeHtml(badge) + '</span>' +
    '</div>' +
    '<div class="matrix-scroll-wrap">' +
      '<div class="matrix-inner">' +
        '<div class="matrix-time-header">' +
          '<span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>24h</span>' +
        '</div>' +
        '<div class="matrix-grid">' + rowsHtml + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="matrix-legend">' +
      '<div class="matrix-legend-item"><span class="matrix-legend-box lvl-1"></span><span>0-15m</span></div>' +
      '<div class="matrix-legend-item"><span class="matrix-legend-box lvl-2"></span><span>15-30m</span></div>' +
      '<div class="matrix-legend-item"><span class="matrix-legend-box lvl-3"></span><span>30-45m</span></div>' +
      '<div class="matrix-legend-item"><span class="matrix-legend-box lvl-4"></span><span>45-60m</span></div>' +
      '<div class="matrix-legend-item"><span class="matrix-legend-box lvl-5"></span><span>Peak Flow</span></div>' +
    '</div>' +
  '</div>';
}

function renderSkillVelocity(opts){
  opts = opts || {};
  var title = opts.title || 'Skill Acquisition Velocity';
  var subtitle = opts.subtitle || 'Daily study time vs. curriculum benchmark';
  var badge = opts.badge || '5 DAYS GOAL MET';
  var avg = opts.avg || 'Avg. 4.2 h';
  var codeTime = opts.codeTime || '6 h 32 m';
  var theoryTime = opts.theoryTime || '3 h 18 m';

  return '' +
  '<div class="velocity-card">' +
    '<div class="velocity-head">' +
      '<div>' +
        '<h3>' + escapeHtml(title) + '</h3>' +
        '<p>' + escapeHtml(subtitle) + '</p>' +
      '</div>' +
      '<span class="telemetry-badge-green">' + escapeHtml(badge) + '</span>' +
    '</div>' +
    '<div class="velocity-chart-area">' +
      '<span class="velocity-avg-pill">' + escapeHtml(avg) + '</span>' +
      '<div class="velocity-bar-col"><div class="velocity-bar-wrap"><div class="velocity-bar-fill" style="height:36%;"></div></div><span class="velocity-bar-label">S</span></div>' +
      '<div class="velocity-bar-col"><div class="velocity-bar-wrap"><div class="velocity-bar-fill" style="height:80%;"></div></div><span class="velocity-bar-label">M</span></div>' +
      '<div class="velocity-bar-col"><div class="velocity-bar-wrap"><div class="velocity-bar-fill" style="height:70%;"></div></div><span class="velocity-bar-label">T</span></div>' +
      '<div class="velocity-bar-col"><div class="velocity-bar-wrap"><div class="velocity-bar-fill" style="height:94%;"></div></div><span class="velocity-bar-label">W</span></div>' +
      '<div class="velocity-bar-col"><div class="velocity-bar-wrap"><div class="velocity-bar-fill" style="height:85%;"></div></div><span class="velocity-bar-label">T</span></div>' +
      '<div class="velocity-bar-col"><div class="velocity-bar-wrap"><div class="velocity-bar-fill" style="height:46%;"></div></div><span class="velocity-bar-label">F</span></div>' +
      '<div class="velocity-bar-col"><div class="velocity-bar-wrap"><div class="velocity-bar-fill" style="height:62%;"></div></div><span class="velocity-bar-label">S</span></div>' +
    '</div>' +
    '<div class="velocity-progress-wrap">' +
      '<div class="velocity-split-bar">' +
        '<div class="velocity-split-left"></div>' +
        '<div class="velocity-split-right"></div>' +
      '</div>' +
      '<div class="velocity-split-labels">' +
        '<span>Hands-on Code: <strong>' + escapeHtml(codeTime) + '</strong></span>' +
        '<span>Theory & Mentorship: <strong>' + escapeHtml(theoryTime) + '</strong></span>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function renderSkillDemandCard(skillsData){
  var list = (skillsData && skillsData.demand && skillsData.demand.length) ? skillsData.demand : [
    { name:'Communication', count: 2 },
    { name:'JavaScript', count: 1 },
    { name:'React', count: 1 },
    { name:'Data Analysis', count: 1 }
  ];
  var max = Math.max(list[0].count, 1);
  var html = list.slice(0, 6).map(function(s){
    var pct = Math.round(s.count / max * 100);
    return '<div class="skill-bar-row"><div class="bar-label"><span>' + escapeHtml(s.name) + '</span><span>' + s.count + '</span></div><div class="bar-track"><div class="bar-fill" style="width:' + pct + '%; background:linear-gradient(90deg, #0284c7 0%, #10b981 100%);"></div></div></div>';
  }).join('');

  return '' +
  '<div class="dashboard-section">' +
    '<div class="section-heading"><div><h2>Skill demand</h2><p>Most requested skills across postings.</p></div></div>' +
    html +
  '</div>';
}

// Wraps an action handler so any thrown API error becomes a toast instead of a blank failure.
async function guarded(fn){
  try { await fn(); }
  catch(err){ showToast(err.message || 'Something went wrong.'); }
}

/* =========================================================
   RENDER: ROOT
========================================================= */
async function render(){
  var app = document.getElementById('app');
  if(!session.user){
    app.innerHTML = renderAuth();
  } else {
    app.innerHTML = '<div class="dashboard-page"><main class="dashboard-main"><p class="empty-message">Loading…</p></main></div>';
    app.innerHTML = await renderAppShell();
  }
}

/* =========================================================
   RENDER: AUTH
========================================================= */
var DEMO_ACCOUNTS = {
  student: { email:'aditi@student.edu', label:'Aditi (Student)' },
  academician: { email:'rohan@university.edu', label:'Rohan (Academician)' },
  industry: { email:'priya@technova.com', label:'Priya (Industry)' },
  admin: { email:'admin@nit.edu', label:'Admin' }
};

/* portalTab: which "professional" sub-role is shown in the middle card (UI-only — login itself is role-agnostic) */
ui.portalTab = ui.portalTab || 'academician';

function renderAuth(){
  return '<div class="auth-page">' + (ui.authTab==='signup' ? renderSignupPanel() : renderPortalLogin()) + '</div>';
}

function renderPortalLogin(){
  return '' +
  '<div class="portal-select">' +
    '<div class="portal-hero">' +
      '<img class="brand-logo hero-brand-logo" src="assets/logo.jpeg" alt="SkillBridge">' +
      '<h1>Select Your Login Portal</h1>' +
      '<p>Choose your account type to access the platform.</p>' +
    '</div>' +
    (ui.authError ? '<div class="auth-error portal-error">' + escapeHtml(ui.authError) + '</div>' : '') +
    '<div class="portal-grid">' +
      portalCard({
        key:'admin', accent:'admin', icon:'🛡️', title:'Admin Login',
        subtitle:'Institution administrators',
        avatarIcon:'🧑‍💼', portalLabel:'Admin Portal',
        demo: DEMO_ACCOUNTS.admin
      }) +
      portalCard({
        key:'professional', accent:'professional', icon:'💼', title:'Professional Login',
        subtitle:'Academicians & industry partners',
        avatarIcon:'👩‍🏫', portalLabel:'Professional Portal',
        roleToggle:true,
        demo: DEMO_ACCOUNTS[ui.portalTab]
      }) +
      portalCard({
        key:'student', accent:'student', icon:'🎓', title:'Student Login',
        subtitle:'Learners building their profile',
        avatarIcon:'🧑‍🎓', portalLabel:'Student Portal',
        demo: DEMO_ACCOUNTS.student,
        showSignup:true
      }) +
    '</div>' +
    '<p class="portal-footnote">Demo password for every quick-fill account: <strong>demo123</strong></p>' +
  '</div>';
}

function portalCard(cfg){
  var toggle = cfg.roleToggle ? (
    '<div class="portal-role-toggle">' +
      '<button type="button" class="' + (ui.portalTab==='academician'?'active':'') + '" onclick="setPortalTab(\'academician\')">Academician</button>' +
      '<button type="button" class="' + (ui.portalTab==='industry'?'active':'') + '" onclick="setPortalTab(\'industry\')">Industry</button>' +
    '</div>'
  ) : '';
  var signupLink = cfg.showSignup ? '<a onclick="switchAuthTab(\'signup\')">Register Here</a>' : '';
  return '' +
  '<div class="portal-card ' + cfg.accent + '">' +
    '<div class="portal-card-head"><span class="portal-icon">' + cfg.icon + '</span><h3>' + cfg.title + '</h3><p>' + cfg.subtitle + '</p></div>' +
    '<div class="portal-card-body">' +
      toggle +
      '<form onsubmit="return handleLogin(event)">' +
        '<label>Email Address</label>' +
        '<input type="email" name="email" placeholder="' + escapeHtml(cfg.demo.email) + '" required>' +
        '<label>Password</label>' +
        '<input type="password" name="password" placeholder="••••••••" required>' +
        '<button type="submit" class="auth-button portal-login-btn">Log In</button>' +
      '</form>' +
      '<button type="button" class="demo-chip portal-demo" onclick="demoLogin(\'' + cfg.demo.email + '\')">Try demo: ' + escapeHtml(cfg.demo.label) + '</button>' +
      '<div class="portal-links">' + (signupLink ? ('New here? ' + signupLink + ' &middot; ') : '') + '<a onclick="showToast(\'Ask your institution admin to reset your password.\')">Forgot Password?</a></div>' +
    '</div>' +
    '<div class="portal-foot">' +
      '<div class="portal-avatar">' + cfg.avatarIcon + '</div>' +
      '<span>' + cfg.portalLabel + '</span>' +
    '</div>' +
  '</div>';
}

function setPortalTab(tab){ ui.portalTab = tab; render(); }

function renderSignupPanel(){
  return '' +
  '<div class="auth-shell single">' +
    '<div class="auth-card">' +
      '<div class="signup-back"><a onclick="switchAuthTab(\'login\')">&larr; Back to portal selection</a></div>' +
      renderSignupForm() +
    '</div>' +
  '</div>';
}

function renderLoginForm(){
  return '' +
  '<h1>Welcome back</h1>' +
  '<p class="auth-subtitle">Log in to continue building your skill profile.</p>' +
  (ui.authError ? '<div class="auth-error">' + escapeHtml(ui.authError) + '</div>' : '') +
  '<form onsubmit="return handleLogin(event)">' +
    '<label>Email</label>' +
    '<input type="email" name="email" placeholder="you@example.com" required>' +
    '<label>Password</label>' +
    '<input type="password" name="password" placeholder="••••••••" required>' +
    '<button type="submit" class="auth-button">Log in</button>' +
  '</form>' +
  '<div class="auth-footer">New here? <a onclick="switchAuthTab(\'signup\')">Create an account</a></div>';
}

function renderSignupForm(){
  return '' +
  '<h1>Create your account</h1>' +
  '<p class="auth-subtitle">Tell us who you are so we can set up the right dashboard.</p>' +
  (ui.authError ? '<div class="auth-error">' + escapeHtml(ui.authError) + '</div>' : '') +
  '<form onsubmit="return handleSignup(event)">' +
    '<label>Full name</label>' +
    '<input type="text" name="name" placeholder="Jordan Lee" required>' +
    '<label>Email</label>' +
    '<input type="email" name="email" placeholder="you@example.com" required>' +
    '<label>Password</label>' +
    '<input type="password" name="password" placeholder="Create a password" required minlength="4">' +
    '<label>I am a...</label>' +
    '<select name="role" required>' +
      '<option value="student">Student</option>' +
      '<option value="academician">Academician</option>' +
      '<option value="industry">Industry Representative</option>' +
      '<option value="admin">Institution Admin</option>' +
    '</select>' +
    '<label>Institution / Organization</label>' +
    '<input type="text" name="org" placeholder="e.g. Your college or company name">' +
    '<button type="submit" class="auth-button">Create account</button>' +
  '</form>' +
  '<div class="auth-footer">Already have an account? <a onclick="switchAuthTab(\'login\')">Log in</a></div>';
}

function switchAuthTab(tab){ ui.authTab = tab; ui.authError=''; render(); }

async function handleLogin(e){
  e.preventDefault();
  var f = new FormData(e.target);
  try{
    var res = await api.login(f.get('email'), f.get('password'));
    setToken(res.token);
    session.user = res.user;
    session.view = 'dashboard';
    ui.authError = '';
    await render();
  }catch(err){
    ui.authError = err.message;
    render();
  }
  return false;
}

async function handleSignup(e){
  e.preventDefault();
  var f = new FormData(e.target);
  try{
    var res = await api.register({
      name: f.get('name'), email: f.get('email'), password: f.get('password'),
      role: f.get('role'), org: f.get('org')
    });
    setToken(res.token);
    session.user = res.user;
    session.view = 'dashboard';
    ui.authError = '';
    await render();
  }catch(err){
    ui.authError = err.message;
    render();
  }
  return false;
}

async function demoLogin(email){
  try{
    var res = await api.login(email, 'demo123');
    setToken(res.token);
    session.user = res.user;
    session.view = 'dashboard';
    await render();
  }catch(err){ showToast(err.message); }
}

function logout(){
  setToken(null);
  session.user = null;
  ui.profileMenuOpen = false;
  render();
}

/* =========================================================
   RENDER: APP SHELL
========================================================= */
async function setView(view){ session.view = view; ui.profileMenuOpen=false; await render(); }
function toggleProfileMenu(){ ui.profileMenuOpen = !ui.profileMenuOpen; render(); }

async function renderAppShell(){
  var user = session.user;
  var nav = NAV[user.role];

  var navHtml = nav.map(function(item){
    var active = session.view===item[0] ? 'active' : '';
    return '<button class="' + active + '" onclick="setView(\'' + item[0] + '\')"><span>' + item[2] + '</span><span>' + item[1] + '</span></button>';
  }).join('');

  var dropdown = ui.profileMenuOpen ? (
    '<div class="profile-dropdown">' +
      '<div class="profile-dropdown-header">' +
        '<div class="dropdown-avatar">' + initials(user.name) + '</div>' +
        '<div class="dropdown-user-info"><strong>' + escapeHtml(user.name) + '</strong><span>' + escapeHtml(user.email) + '</span></div>' +
      '</div>' +
      '<button onclick="setView(\'profile\')">👤 Edit Profile</button>' +
      '<div class="profile-dropdown-divider"></div>' +
      '<button class="profile-logout" onclick="logout()">🚪 Log out</button>' +
    '</div>'
  ) : '';

  var titleInfo = viewTitle(user);
  var contentHtml = await renderContent(user);

  return '' +
  '<div class="dashboard-page">' +
    '<aside class="sidebar">' +
      '<div class="logo"><img class="brand-logo" src="assets/logo.jpeg" alt="SkillBridge"></div>' +
      '<nav>' + navHtml + '</nav>' +
      '<button class="logout-button" onclick="logout()">🚪 Log out</button>' +
    '</aside>' +
    '<main class="dashboard-main">' +
      '<div class="dashboard-header">' +
        '<div><h1>' + titleInfo.title + '</h1><p>' + titleInfo.subtitle + '</p></div>' +
        '<div class="profile-menu">' +
          '<button class="profile-circle" onclick="toggleProfileMenu()">' + initials(user.name) + '</button>' +
          dropdown +
        '</div>' +
      '</div>' +
      '<div id="view-content">' + contentHtml + '</div>' +
    '</main>' +
  '</div>';
}

function viewTitle(user){
  var v = session.view;
  var map = {
    dashboard: {title:'Dashboard', subtitle:'Welcome back, ' + user.name.split(' ')[0] + '.'},
    profile: {title:'My Profile', subtitle:'Keep your information up to date.'},
    skills: {title:'Skills', subtitle:'Track what you know and how well you know it.'},
    assessment: {title:'Skill Assessment', subtitle:'Rate yourself honestly — this shapes your recommendations.'},
    projects: {title:'Projects', subtitle:'Showcase what you have built.'},
    opportunities: {title: user.role==='industry' ? 'Manage Opportunities' : 'Opportunities', subtitle: user.role==='industry' ? 'Post and manage internships, jobs, and training programs.' : 'Internships, jobs, and training matched to your skills.'},
    applicants: {title:'Applicants', subtitle:'Review and manage candidates for your postings.'},
    mentorship: {title:'Mentorship', subtitle: (user.role==='student') ? 'Connect with mentors from academia and industry.' : 'Manage mentorship requests from students.'},
    events: {title:'Events', subtitle:'Workshops, guest lectures, and innovation challenges.'},
    portfolio: {title:'Digital Portfolio', subtitle:'A shareable snapshot of your skills and work.'},
    programs: {title:'Programs', subtitle:'FDPs, industrial training, consultancy, and collaborative projects.'},
    users: {title:'Users', subtitle:'Everyone on the platform.'},
    analytics: {title:'Analytics', subtitle:'Skill demand, supply, and placement trends.'}
  };
  return map[v] || {title:'Dashboard', subtitle:''};
}

async function renderContent(user){
  var v = session.view;
  try{
    if(user.role==='student'){
      if(v==='dashboard') return await studentDashboard(user);
      if(v==='profile') return renderProfileForm(user);
      if(v==='skills') return await renderSkillsView(user);
      if(v==='assessment') return await renderAssessmentView(user);
      if(v==='projects') return renderProjectsView(user);
      if(v==='opportunities') return await renderOpportunitiesBrowse(user);
      if(v==='mentorship') return await renderMentorshipStudent(user);
      if(v==='events') return await renderEventsView(user);
      if(v==='portfolio') return await renderPortfolioView(user);
    }
    if(user.role==='academician'){
      if(v==='dashboard') return await academicianDashboard(user);
      if(v==='profile') return renderProfileForm(user);
      if(v==='programs') return await renderProgramsView(user);
      if(v==='mentorship') return await renderMentorshipAsMentor(user);
      if(v==='events') return await renderEventsView(user);
    }
    if(user.role==='industry'){
      if(v==='dashboard') return await industryDashboard(user);
      if(v==='profile') return renderProfileForm(user);
      if(v==='opportunities') return await renderOpportunitiesManage(user);
      if(v==='applicants') return await renderApplicantsView(user);
      if(v==='mentorship') return await renderMentorshipAsMentor(user);
      if(v==='events') return await renderEventsView(user);
    }
    if(user.role==='admin'){
      if(v==='dashboard') return await adminDashboard(user);
      if(v==='users') return await renderUsersView(user);
      if(v==='opportunities') return await renderAdminOpportunities(user);
      if(v==='analytics') return await renderAnalyticsView(user);
      if(v==='events') return await renderEventsView(user);
    }
    return await studentDashboard(user);
  }catch(err){
    return '<div class="dashboard-section"><p class="auth-error">Could not load this page: ' + escapeHtml(err.message) + '</p></div>';
  }
}

/* re-renders just the content pane (keeps focus in filter inputs) */
async function renderContentOnly(){
  var html = await renderContent(session.user);
  document.getElementById('view-content').innerHTML = html;
}

/* =========================================================
   SHARED: PROFILE CARD + PROFILE FORM
========================================================= */
function profileCompleteness(user){
  var checks = [
    !!user.name, !!user.headline, !!user.bio,
    (user.skills||[]).length>0, !!(user.orgName||user.institution)
  ];
  if(user.role==='student') checks.push((user.projects||[]).length>0);
  var done = checks.filter(Boolean).length;
  return Math.round((done/checks.length)*100);
}

function ringChartHtml(pct, label){
  var deg = Math.round(pct*3.6);
  return '' +
  '<div class="ring-chart" style="background:conic-gradient(var(--ring-color) ' + deg + 'deg, var(--ring-track) ' + deg + 'deg)">' +
    '<div class="ring-chart-inner"><strong>' + pct + '%</strong><span>' + label + '</span></div>' +
  '</div>';
}

function profileCardHtml(user, extraLine){
  var pct = profileCompleteness(user);
  return '' +
  '<div class="profile-card">' +
    '<div class="profile-avatar">' + initials(user.name) + '</div>' +
    '<div class="profile-info">' +
      '<h2>' + escapeHtml(user.name) + '</h2>' +
      '<p>' + escapeHtml(user.headline || (user.orgName||user.institution||'') ) + '</p>' +
      '<div class="profile-role"><span class="role-badge ' + user.role + '">' + ROLE_LABEL[user.role] + '</span>' + (extraLine||'') + '</div>' +
    '</div>' +
    ringChartHtml(pct, 'Profile') +
    '<button class="edit-profile" onclick="setView(\'profile\')">Edit Profile</button>' +
  '</div>';
}

function renderProfileForm(user){
  var orgLabel = user.role==='industry' ? 'Organization Name' : 'Institution';
  var orgVal = user.role==='industry' ? (user.orgName||'') : (user.institution||'');
  var extraFields = '';
  if(user.role==='industry'){
    extraFields = '<div class="form-group"><label>Sector</label><input type="text" name="sector" value="' + escapeHtml(user.sector||'') + '" placeholder="e.g. Software & IT Services"></div>';
  }
  if(user.role==='academician'){
    extraFields = '<div class="form-group"><label>Department</label><input type="text" name="department" value="' + escapeHtml(user.department||'') + '" placeholder="e.g. Computer Science"></div>';
  }
  var mentorToggle = (user.role==='academician' || user.role==='industry') ? (
    '<div class="form-group full-width">' +
      '<label>Available as a Mentor</label>' +
      '<div class="checkbox-toggle"><button type="button" class="switch ' + (user.isMentor?'on':'') + '" onclick="toggleMentor()"></button>' +
      '<span style="color:#6b7280;font-size:13.5px;">Students will be able to find you and request mentorship.</span></div>' +
    '</div>'
  ) : '';

  return '' +
  '<div class="dashboard-section">' +
    '<div class="section-heading"><div><h2>Profile details</h2><p>This information appears on your dashboard and, if applicable, your portfolio.</p></div></div>' +
    '<form onsubmit="return saveProfile(event)">' +
      '<div class="profile-form">' +
        '<div class="form-group"><label>Full Name</label><input type="text" name="name" value="' + escapeHtml(user.name) + '" required></div>' +
        '<div class="form-group"><label>Email</label><input type="email" value="' + escapeHtml(user.email) + '" disabled style="background:#f3f4f6;color:#9ca3af;"></div>' +
        '<div class="form-group"><label>Headline</label><input type="text" name="headline" value="' + escapeHtml(user.headline||'') + '" placeholder="A one-line description of who you are"></div>' +
        '<div class="form-group"><label>' + orgLabel + '</label><input type="text" name="org" value="' + escapeHtml(orgVal) + '"></div>' +
        extraFields +
        '<div class="form-group full-width"><label>Bio</label><textarea name="bio" placeholder="Tell others about yourself...">' + escapeHtml(user.bio||'') + '</textarea></div>' +
        mentorToggle +
      '</div>' +
      '<div class="profile-actions"><span class="save-message" id="save-msg"></span><button type="submit" class="primary-btn save-profile">Save Changes</button></div>' +
    '</form>' +
  '</div>';
}

async function saveProfile(e){
  e.preventDefault();
  var f = new FormData(e.target);
  await guarded(async function(){
    var res = await api.updateProfile({
      name: f.get('name'), headline: f.get('headline'), bio: f.get('bio'),
      org: f.get('org'), sector: f.get('sector'), department: f.get('department')
    });
    session.user = res.user;
    showToast('Profile saved.');
    await render();
  });
  return false;
}

async function toggleMentor(){
  await guarded(async function(){
    var res = await api.toggleMentor();
    session.user = res.user;
    await render();
  });
}

/* =========================================================
   STUDENT: DASHBOARD
========================================================= */
async function studentDashboard(user){
  var apps = (await api.myApplications()).applications;
  var opps = (await api.listOpportunities()).opportunities;
  var recommended = opps.slice().sort(function(a,b){ return (b.match||0)-(a.match||0); }).slice(0,3);

  var recHtml = recommended.length ? recommended.map(function(o){
    return '<div class="education-card">' +
      '<div class="education-icon">🚀</div>' +
      '<div style="flex:1;min-width:180px;"><h3>' + escapeHtml(o.title) + '</h3><p>' + escapeHtml(o.industryName) + ' · ' + escapeHtml(o.type) + '</p></div>' +
      '<div class="match-score ' + matchClass(o.match||0) + '">' + (o.match||0) + '%<small>match</small></div>' +
    '</div>';
  }).join('') : '<p class="empty-message">Add a few skills to get personalized opportunity recommendations.</p>';

  return '' +
  renderPerformanceTelemetry({ id: 'student_dash' }) +
  '<div class="dashboard-section">' +
    '<div class="section-heading"><div><h2>Recommended for you</h2><p>Based on the skills in your profile.</p></div><button class="small-btn" onclick="setView(\'opportunities\')">View all</button></div>' +
    recHtml +
  '</div>' +
  '<div class="two-col">' +
    renderSkillVelocity({ title: 'Skill Acquisition Velocity', subtitle: 'Daily study time vs. curriculum benchmark' }) +
    '<div class="dashboard-section">' +
      '<div class="section-heading"><div><h2>Quick actions</h2><p>Jump directly to active workflows.</p></div></div>' +
      '<div class="quick-actions">' +
        '<button onclick="setView(\'assessment\')"><span>📝</span> Take Assessment</button>' +
        '<button onclick="setView(\'projects\')"><span>💼</span> Add a Project</button>' +
        '<button onclick="setView(\'opportunities\')"><span>🚀</span> Browse Opportunities</button>' +
        '<button onclick="setView(\'mentorship\')"><span>🤝</span> Find a Mentor</button>' +
      '</div>' +
    '</div>' +
  '</div>' +
  profileCardHtml(user);
}

/* =========================================================
   STUDENT: SKILLS
========================================================= */
async function renderSkillsView(user){
  var datalist = '<datalist id="skill-suggestions">' + MASTER_SKILLS.map(function(s){ return '<option value="' + escapeHtml(s) + '">'; }).join('') + '</datalist>';
  var tags = (user.skills||[]).length ? user.skills.map(function(s){
    return '<span class="skill-tag">' + escapeHtml(s.name) + ' <span class="lvl">· ' + s.level + '</span> <button onclick="removeSkill(\'' + escapeHtml(s.name).replace(/'/g,"\\'") + '\')">×</button></span>';
  }).join('') : '<p class="empty-message">You haven\'t added any skills yet. Add a few below to unlock personalized matches.</p>';

  var skillsData = (await api.analyticsSkills().catch(function(){ return null; }));
  var demand = skillsData ? skillsData.demand : [];
  var have = (user.skills||[]).map(function(s){ return s.name.toLowerCase(); });
  var gaps = demand.filter(function(d){ return have.indexOf(d.name.toLowerCase())===-1; }).slice(0,6);
  var gapHtml = gaps.length ? gaps.map(function(g){
    return '<span class="skill-tag" style="background:#fff7ed;color:#c2410c;">' + escapeHtml(g.name) + ' <button onclick="quickAddSkill(\'' + escapeHtml(g.name).replace(/'/g,"\\'") + '\')" style="color:#c2410c;">+</button></span>';
  }).join('') : '<p class="empty-message">No obvious skill gaps right now — nice work.</p>';

  var gapSection = skillsData ? (
    '<div class="dashboard-section"><div class="section-heading"><div><h2>Skill gap insights</h2><p>In-demand skills across current opportunities that you don\'t have yet.</p></div></div><div class="skills-list">' + gapHtml + '</div></div>'
  ) : '';

  return '' +
  datalist +
  '<div class="dashboard-section">' +
    '<div class="section-heading"><div><h2>My skills</h2><p>These power your opportunity matches and portfolio.</p></div></div>' +
    '<div class="skill-input">' +
      '<input type="text" id="new-skill-name" list="skill-suggestions" placeholder="e.g. React, Communication...">' +
      '<select id="new-skill-level">' + SKILL_LEVELS.map(function(l){ return '<option ' + (l==='Intermediate'?'selected':'') + '>' + l + '</option>'; }).join('') + '</select>' +
      '<button onclick="addSkill()">Add Skill</button>' +
    '</div>' +
    '<div class="skills-list">' + tags + '</div>' +
  '</div>' +
  gapSection;
}

async function addSkill(){
  var nameEl = document.getElementById('new-skill-name');
  var levelEl = document.getElementById('new-skill-level');
  var name = (nameEl.value||'').trim();
  if(!name) return;
  await guarded(async function(){
    var res = await api.addSkill(name, levelEl.value);
    session.user.skills = res.skills;
    showToast('Skill added.');
    await render();
  });
}
async function quickAddSkill(name){
  await guarded(async function(){
    var res = await api.addSkill(name, 'Beginner');
    session.user.skills = res.skills;
    await render();
  });
}
async function removeSkill(name){
  await guarded(async function(){
    var res = await api.removeSkill(name);
    session.user.skills = res.skills;
    await render();
  });
}

/* =========================================================
   STUDENT: ASSESSMENT
========================================================= */
async function renderAssessmentView(user){
  var history = (await api.myAssessments()).assessments || [];
  var last = history.length ? history[history.length-1] : null;

  var cats = ASSESSMENT_CATS.map(function(cat){
    var picked = ui.assessmentDraft[cat.id];
    var buttons = [1,2,3,4,5].map(function(lvl){
      return '<button type="button" class="' + (picked===lvl?'selected':'') + '" onclick="pickAssessment(\'' + cat.id + '\',' + lvl + ')">' + lvl + ' · ' + ASSESSMENT_LEVEL_LABELS[lvl-1] + '</button>';
    }).join('');
    return '<div class="assessment-cat"><h4>' + cat.label + '</h4><p class="cat-desc">' + cat.desc + '</p><div class="level-select">' + buttons + '</div></div>';
  }).join('');

  var resultsHtml = '';
  if(last){
    resultsHtml = '<div class="dashboard-section"><div class="section-heading"><div><h2>Latest results</h2><p>Completed ' + history.length + ' time' + (history.length>1?'s':'') + ', last on ' + new Date(last.date).toLocaleDateString() + '.</p></div></div>' +
      ASSESSMENT_CATS.map(function(cat){
        var val = last.scores[cat.id]||0;
        return '<div class="skill-bar-row"><div class="bar-label"><span>' + cat.label + '</span><span>' + ASSESSMENT_LEVEL_LABELS[val-1] + '</span></div><div class="bar-track"><div class="bar-fill" style="width:' + (val*20) + '%"></div></div></div>';
      }).join('') +
    '</div>';
  }

  return '' +
  '<div class="dashboard-section">' +
    '<div class="section-heading"><div><h2>Self-assessment</h2><p>Rate yourself 1 (Beginner) to 5 (Expert) in each area. Be honest — it helps us recommend better opportunities.</p></div></div>' +
    cats +
    '<button class="primary-btn" onclick="submitAssessment()">Submit Assessment</button>' +
  '</div>' +
  resultsHtml;
}

function pickAssessment(catId, lvl){ ui.assessmentDraft[catId]=lvl; render(); }

async function submitAssessment(){
  var missing = ASSESSMENT_CATS.filter(function(c){ return !ui.assessmentDraft[c.id]; });
  if(missing.length){ showToast('Please rate all ' + ASSESSMENT_CATS.length + ' categories.'); return; }
  await guarded(async function(){
    var res = await api.submitAssessment(Object.assign({}, ui.assessmentDraft));
    session.user.skills = res.skills;
    ui.assessmentDraft = {};
    showToast('Assessment submitted.');
    await render();
  });
}

/* =========================================================
   STUDENT: PROJECTS
========================================================= */
function renderProjectsView(user){
  var projects = user.projects || [];
  var list = projects.length ? projects.map(function(p){
    return '<div class="project-card">' +
      '<div class="project-content">' +
        '<div class="project-title-row"><h3>' + escapeHtml(p.title) + '</h3><span class="project-status ' + (p.status==='Completed'?'done':'') + '">' + escapeHtml(p.status) + '</span></div>' +
        '<p>' + escapeHtml(p.description) + '</p>' +
        '<div class="project-tech">' + (p.tech||[]).map(function(t){ return '<span>' + escapeHtml(t) + '</span>'; }).join('') + '</div>' +
        (p.link ? '<a class="project-link" href="' + escapeHtml(p.link) + '" target="_blank" rel="noopener">View project →</a>' : '') +
      '</div>' +
      '<button class="remove-project" onclick="removeProject(\'' + p.id + '\')">×</button>' +
    '</div>';
  }).join('') : '<p class="empty-message">No projects yet — add your first one below.</p>';

  return '' +
  '<div class="dashboard-section">' +
    '<div class="section-heading"><div><h2>Add a project</h2></div></div>' +
    '<form onsubmit="return addProject(event)">' +
      '<div class="profile-form">' +
        '<div class="form-group"><label>Title</label><input type="text" name="title" required placeholder="e.g. Campus Event Manager"></div>' +
        '<div class="form-group"><label>Status</label><select name="status"><option>Ongoing</option><option>Completed</option></select></div>' +
        '<div class="form-group full-width"><label>Description</label><textarea name="description" placeholder="What does it do? What was your role?"></textarea></div>' +
        '<div class="form-group"><label>Technologies (comma separated)</label><input type="text" name="tech" placeholder="React, Node.js, MongoDB"></div>' +
        '<div class="form-group"><label>Link (optional)</label><input type="url" name="link" placeholder="https://..."></div>' +
      '</div>' +
      '<div class="profile-actions"><button type="submit" class="primary-btn save-profile">Add Project</button></div>' +
    '</form>' +
  '</div>' +
  '<div class="dashboard-section"><div class="section-heading"><div><h2>My projects</h2></div></div><div class="projects-list">' + list + '</div></div>';
}

async function addProject(e){
  e.preventDefault();
  var f = new FormData(e.target);
  await guarded(async function(){
    var res = await api.addProject({
      title: f.get('title'), description: f.get('description'),
      tech: f.get('tech'), status: f.get('status'), link: f.get('link')
    });
    session.user.projects = res.projects;
    showToast('Project added.');
    await render();
  });
  return false;
}
async function removeProject(id){
  await guarded(async function(){
    var res = await api.removeProject(id);
    session.user.projects = res.projects;
    await render();
  });
}

/* =========================================================
   STUDENT: OPPORTUNITIES BROWSE
========================================================= */
async function renderOpportunitiesBrowse(user){
  var params = {};
  if(ui.oppSearch) params.q = ui.oppSearch;
  if(ui.oppTypeFilter) params.type = ui.oppTypeFilter;
  var opps = (await api.listOpportunities(params)).opportunities;
  opps.sort(function(a,b){ return (b.match||0)-(a.match||0); });

  var userSkillNames = (user.skills||[]).map(function(s){return s.name.toLowerCase();});

  var cards = opps.length ? opps.map(function(o){
    var skillTags = (o.requiredSkills||[]).map(function(s){
      var matched = userSkillNames.indexOf(s.toLowerCase())>-1;
      return '<span class="skill-tag' + (matched?' matched':'') + '">' + escapeHtml(s) + '</span>';
    }).join('');
    var actionHtml = o.myStatus ? '<span class="status-badge ' + o.myStatus.toLowerCase() + '">' + o.myStatus + '</span>' : '<button class="primary-btn" onclick="applyOpportunity(\'' + o.id + '\')">Apply Now</button>';
    return '<div class="job-card">' +
      '<div class="job-card-header"><div><h3>' + escapeHtml(o.title) + '</h3><p>' + escapeHtml(o.industryName) + ' · ' + escapeHtml(o.type) + '</p></div><div class="match-score ' + matchClass(o.match||0) + '">' + (o.match||0) + '%<small>match</small></div></div>' +
      '<div class="job-match-text">' + escapeHtml(o.description) + '</div>' +
      '<div class="job-skills">' + skillTags + '</div>' +
      '<p class="job-location">Deadline: ' + fmtDate(o.deadline) + '</p>' +
      actionHtml +
    '</div>';
  }).join('') : '<p class="empty-message">No opportunities match your filters.</p>';

  return '' +
  '<div class="filter-bar">' +
    '<input type="text" placeholder="Search by title or company..." value="' + escapeHtml(ui.oppSearch||'') + '" oninput="ui.oppSearch=this.value; renderContentOnly();">' +
    '<select onchange="ui.oppTypeFilter=this.value; renderContentOnly();">' +
      '<option value="">All types</option>' +
      '<option ' + (ui.oppTypeFilter==='Internship'?'selected':'') + '>Internship</option>' +
      '<option ' + (ui.oppTypeFilter==='Job'?'selected':'') + '>Job</option>' +
      '<option ' + (ui.oppTypeFilter==='Training'?'selected':'') + '>Training</option>' +
    '</select>' +
  '</div>' +
  '<div class="jobs-grid">' + cards + '</div>';
}

async function applyOpportunity(oppId){
  await guarded(async function(){
    await api.applyToOpportunity(oppId);
    showToast('Application submitted!');
    await render();
  });
}

/* =========================================================
   STUDENT: MENTORSHIP
========================================================= */
async function renderMentorshipStudent(user){
  var mentors = (await api.listMentors()).mentors;
  var myRequests = (await api.myMentorships()).mentorships;
  var requestedIds = {};
  myRequests.forEach(function(m){ requestedIds[m.mentorId] = m; });

  var mentorCards = mentors.length ? mentors.map(function(m){
    var existing = requestedIds[m.id];
    var actionHtml = existing ? '<span class="status-badge ' + existing.status + '">' + existing.status + '</span>' : '<button class="small-btn go" onclick="requestMentorship(\'' + m.id + '\')">Request</button>';
    return '<div class="mentor-card">' +
      '<div class="mentor-main"><h3 style="font-size:15.5px;margin-bottom:3px;">' + escapeHtml(m.name) + '</h3>' +
      '<span class="role-badge ' + m.role + '">' + ROLE_LABEL[m.role] + '</span> ' +
      '<p style="color:#6b7280;font-size:13px;margin-top:6px;">' + escapeHtml(m.headline||'') + '</p>' +
      '<div class="tag-row">' + (m.skills||[]).slice(0,4).map(function(s){ return '<span class="mini-tag">' + escapeHtml(s.name) + '</span>'; }).join('') + '</div>' +
      '</div>' + actionHtml +
    '</div>';
  }).join('') : '<p class="empty-message">No mentors are available right now.</p>';

  var reqHtml = myRequests.length ? myRequests.map(function(m){
    return '<div class="mentor-card"><div class="mentor-main"><h3 style="font-size:15px;">' + escapeHtml(m.mentorName) + '</h3>' +
      (m.feedback ? '<p style="color:#6b7280;font-size:13px;margin-top:6px;">Feedback: ' + escapeHtml(m.feedback) + '</p>' : '') +
    '</div><span class="status-badge ' + m.status + '">' + m.status + '</span></div>';
  }).join('') : '<p class="empty-message">You haven\'t requested a mentor yet.</p>';

  return '' +
  '<div class="dashboard-section"><div class="section-heading"><div><h2>Find a mentor</h2><p>Academicians and industry professionals open to mentoring.</p></div></div>' + mentorCards + '</div>' +
  '<div class="dashboard-section"><div class="section-heading"><div><h2>My requests</h2></div></div>' + reqHtml + '</div>';
}

async function requestMentorship(mentorId){
  await guarded(async function(){
    await api.requestMentorship(mentorId);
    showToast('Mentorship request sent.');
    await render();
  });
}

async function renderMentorshipAsMentor(user){
  var requests = (await api.mentorshipInbox()).mentorships;
  if(!requests.length) return '<div class="dashboard-section"><p class="empty-message">No mentorship requests yet. Make sure "Available as a Mentor" is turned on in your profile.</p></div>';

  var html = requests.map(function(m){
    var actions = '';
    if(m.status==='pending'){
      actions = '<button class="small-btn go" onclick="respondMentorship(\'' + m.id + '\',\'accepted\')">Accept</button> <button class="small-btn danger" onclick="respondMentorship(\'' + m.id + '\',\'declined\')">Decline</button>';
    } else if(m.status==='accepted'){
      actions = '<button class="small-btn" onclick="openFeedbackFor(\'' + m.id + '\')">' + (m.feedback ? 'Edit Feedback' : 'Add Feedback') + '</button>';
    }
    var feedbackForm = (ui.feedbackOpenFor===m.id) ? (
      '<form onsubmit="return submitMentorFeedback(event,\'' + m.id + '\')" style="margin-top:10px;display:flex;gap:8px;">' +
      '<input type="text" name="feedback" value="' + escapeHtml(m.feedback||'') + '" placeholder="Short note for your mentee..." style="flex:1;padding:9px 12px;border:1px solid #d8deea;border-radius:8px;">' +
      '<button class="small-btn go" type="submit">Save</button></form>'
    ) : '';
    return '<div class="mentor-card" style="flex-direction:column;align-items:stretch;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">' +
      '<div class="mentor-main"><h3 style="font-size:15.5px;">' + escapeHtml(m.menteeName) + '</h3><span class="status-badge ' + m.status + '">' + m.status + '</span></div>' +
      '<div>' + actions + '</div></div>' + feedbackForm +
    '</div>';
  }).join('');

  return '<div class="dashboard-section"><div class="section-heading"><div><h2>Mentorship requests</h2></div></div>' + html + '</div>';
}

async function respondMentorship(id, status){
  await guarded(async function(){
    await api.respondMentorship(id, status);
    await render();
  });
}
function openFeedbackFor(id){ ui.feedbackOpenFor = id; render(); }
async function submitMentorFeedback(e, id){
  e.preventDefault();
  var f = new FormData(e.target);
  await guarded(async function(){
    await api.submitMentorFeedback(id, f.get('feedback'));
    ui.feedbackOpenFor = null;
    showToast('Feedback saved.');
    await render();
  });
  return false;
}

/* =========================================================
   EVENTS (shared)
========================================================= */
async function renderEventsView(user){
  var canCreate = user.role==='academician' || user.role==='industry' || user.role==='admin';
  var createForm = canCreate ? (
    '<div class="dashboard-section"><div class="section-heading"><div><h2>Create an event</h2></div></div>' +
    '<form onsubmit="return createEvent(event)">' +
      '<div class="profile-form">' +
        '<div class="form-group"><label>Title</label><input type="text" name="title" required></div>' +
        '<div class="form-group"><label>Type</label><select name="type"><option>Workshop</option><option>GuestLecture</option><option>Challenge</option></select></div>' +
        '<div class="form-group"><label>Date</label><input type="date" name="date" required></div>' +
        '<div class="form-group full-width"><label>Description</label><textarea name="description"></textarea></div>' +
      '</div>' +
      '<div class="profile-actions"><button type="submit" class="primary-btn save-profile">Create Event</button></div>' +
    '</form></div>'
  ) : '';

  var events = (await api.listEvents()).events;
  var iconMap = {Workshop:'🛠️',GuestLecture:'🎤',Challenge:'🏆'};
  var list = events.length ? events.map(function(ev){
    var rsvped = (ev.rsvps||[]).indexOf(user.id)>-1;
    return '<div class="education-card">' +
      '<div class="education-icon">' + (iconMap[ev.type]||'📅') + '</div>' +
      '<div style="flex:1;min-width:200px;"><h3>' + escapeHtml(ev.title) + '</h3><p>' + escapeHtml(ev.description||'') + '</p><span class="meta">' + fmtDate(ev.date) + ' · Hosted by ' + escapeHtml(ev.organizerName) + ' · ' + (ev.rsvps||[]).length + ' interested</span></div>' +
      '<button class="small-btn ' + (rsvped?'':'go') + '" onclick="rsvpEvent(\'' + ev.id + '\')">' + (rsvped?'Cancel RSVP':'I\'m Interested') + '</button>' +
    '</div>';
  }).join('') : '<p class="empty-message">No events scheduled yet.</p>';

  return createForm + '<div class="dashboard-section"><div class="section-heading"><div><h2>Upcoming events</h2></div></div>' + list + '</div>';
}
async function createEvent(e){
  e.preventDefault();
  var f = new FormData(e.target);
  await guarded(async function(){
    await api.createEvent({ title: f.get('title'), type: f.get('type'), date: f.get('date'), description: f.get('description') });
    showToast('Event created.');
    await render();
  });
  return false;
}
async function rsvpEvent(id){
  await guarded(async function(){
    await api.rsvpEvent(id);
    await render();
  });
}

/* =========================================================
   STUDENT: PORTFOLIO
========================================================= */
async function renderPortfolioView(user){
  var skillsHtml = (user.skills||[]).length ? user.skills.map(function(s){
    return '<div class="skill-bar-row"><div class="bar-label"><span>' + escapeHtml(s.name) + '</span><span>' + s.level + '</span></div><div class="bar-track"><div class="bar-fill" style="width:' + LEVEL_WIDTH[s.level] + '%"></div></div></div>';
  }).join('') : '<p class="empty-message">No skills added yet.</p>';

  var projHtml = (user.projects||[]).length ? user.projects.map(function(p){
    return '<div class="project-card"><div class="project-content"><div class="project-title-row"><h3>' + escapeHtml(p.title) + '</h3><span class="project-status ' + (p.status==='Completed'?'done':'') + '">' + p.status + '</span></div><p>' + escapeHtml(p.description) + '</p><div class="project-tech">' + (p.tech||[]).map(function(t){return '<span>'+escapeHtml(t)+'</span>';}).join('') + '</div></div></div>';
  }).join('') : '<p class="empty-message">No projects added yet.</p>';

  var certHtml = (user.certifications||[]).length ? '<div class="pill-row">' + user.certifications.map(function(c,i){ return '<span class="skill-tag">' + escapeHtml(c) + ' <button onclick="removeListItem(\'certifications\',' + i + ')">×</button></span>'; }).join('') + '</div>' : '<p class="empty-message">No certifications added yet.</p>';
  var achHtml = (user.achievements||[]).length ? '<div class="pill-row">' + user.achievements.map(function(c,i){ return '<span class="skill-tag" style="background:#f0fdf4;color:#15803d;">' + escapeHtml(c) + ' <button onclick="removeListItem(\'achievements\',' + i + ')" style="color:#15803d;">×</button></span>'; }).join('') : '<p class="empty-message">No achievements added yet.</p>';

  var myApps = (await api.myApplications()).applications;
  var appRows = myApps.length ? myApps.map(function(a){
    var o = a.opportunity;
    return '<tr><td>' + escapeHtml(o? o.title : 'Unknown') + '</td><td>' + escapeHtml(o? o.industryName:'') + '</td><td><span class="status-badge ' + a.status.toLowerCase() + '">' + a.status + '</span></td><td>' + new Date(a.date).toLocaleDateString() + '</td></tr>';
  }).join('') : '<tr><td colspan="4" class="empty-message">No applications yet.</td></tr>';

  return '' +
  '<div class="dashboard-section">' +
    '<div class="section-heading"><div><h2>' + escapeHtml(user.name) + '</h2><p>' + escapeHtml(user.headline||'') + '</p></div><button class="small-btn go" onclick="copyPortfolio()">Copy Summary</button></div>' +
    '<p style="color:#374151;font-size:14px;line-height:1.7;">' + escapeHtml(user.bio||'No bio added yet.') + '</p>' +
  '</div>' +
  '<div class="two-col">' +
    '<div class="dashboard-section"><div class="section-heading"><div><h2>Skills</h2></div></div>' + skillsHtml + '</div>' +
    '<div class="dashboard-section"><div class="section-heading"><div><h2>Certifications & Achievements</h2></div></div>' +
      '<form onsubmit="return addListItem(event,\'certifications\')" style="display:flex;gap:8px;margin-bottom:10px;"><input type="text" name="item" placeholder="Add a certification..." style="flex:1;padding:9px 12px;border:1px solid #d8deea;border-radius:8px;"><button class="small-btn go" type="submit">Add</button></form>' +
      certHtml +
      '<form onsubmit="return addListItem(event,\'achievements\')" style="display:flex;gap:8px;margin:14px 0 10px;"><input type="text" name="item" placeholder="Add an achievement..." style="flex:1;padding:9px 12px;border:1px solid #d8deea;border-radius:8px;"><button class="small-btn go" type="submit">Add</button></form>' +
      achHtml +
    '</div>' +
  '</div>' +
  '<div class="dashboard-section"><div class="section-heading"><div><h2>Projects</h2></div></div><div class="projects-list">' + projHtml + '</div></div>' +
  '<div class="dashboard-section"><div class="section-heading"><div><h2>Application history</h2></div></div><div class="table-wrap"><table class="data-table"><tr><th>Opportunity</th><th>Company</th><th>Status</th><th>Date</th></tr>' + appRows + '</table></div></div>';
}

async function addListItem(e, field){
  e.preventDefault();
  var f = new FormData(e.target);
  var val = (f.get('item')||'').trim();
  if(!val) return false;
  await guarded(async function(){
    var res = await api.addListItem(field, val);
    session.user[field] = res[field];
    await render();
  });
  return false;
}
async function removeListItem(field, idx){
  await guarded(async function(){
    var res = await api.removeListItem(field, idx);
    session.user[field] = res[field];
    await render();
  });
}
function copyPortfolio(){
  var user = session.user;
  var text = user.name + ' — ' + (user.headline||'') + '\n\n' +
    'Skills: ' + (user.skills||[]).map(function(s){return s.name+' ('+s.level+')';}).join(', ') + '\n\n' +
    'Projects: ' + (user.projects||[]).map(function(p){return p.title;}).join(', ') + '\n\n' +
    'Certifications: ' + (user.certifications||[]).join(', ');
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(function(){ showToast('Portfolio summary copied.'); }).catch(function(){ showToast('Could not copy — please copy manually.'); });
  } else {
    showToast('Clipboard not available in this browser.');
  }
}

/* =========================================================
   ACADEMICIAN: DASHBOARD
========================================================= */
async function academicianDashboard(user){
  var programs = (await api.listPrograms()).programs.filter(function(p){ return p.academicianId===user.id; });
  var mentorships = (await api.mentorshipInbox()).mentorships;
  var pending = mentorships.filter(function(m){ return m.status==='pending'; }).length;
  var accepted = mentorships.filter(function(m){ return m.status==='accepted'; }).length;
  var events = (await api.listEvents()).events.filter(function(e){ return e.organizerName===user.name; });

  return '' +
  renderPerformanceTelemetry({
    id: 'acad_dash',
    title: 'Cohort Mentorship & Activity Analytics',
    subtitle: 'Real-time telemetry styled with Neon Spring Green & Sky Blue telemetry visuals.',
    hours: '4 h 20 m',
    hoursLabel: 'Active cohort mentoring hours',
    card1Title: 'Mentorship & Research Focus',
    card2Title: 'Cohort Mastery Target',
    card3Title: 'Cohort Sprint Productivity',
    verifications: '42 Cohort Verifications',
    subDesc: 'Mentorship milestones approved'
  }) +
  renderEngagementMatrix({
    title: 'Cohort Student Engagement Matrix',
    subtitle: 'Weekly hourly activity distribution across active mentees',
    badge: 'PEAK: 2 PM - 6 PM'
  }) +
  '<div class="two-col">' +
    renderSkillVelocity({ title: 'Cohort Skill Velocity', subtitle: 'Student study pace vs. curriculum benchmark' }) +
    '<div class="dashboard-section">' +
      '<div class="section-heading"><div><h2>Quick actions</h2><p>Manage your academic programs and mentee cohort.</p></div></div>' +
      '<div class="quick-actions">' +
        '<button onclick="setView(\'programs\')"><span>🎓</span> Create Program</button>' +
        '<button onclick="setView(\'mentorship\')"><span>🤝</span> View Requests</button>' +
        '<button onclick="setView(\'events\')"><span>📅</span> Post Event</button>' +
        '<button onclick="setView(\'profile\')"><span>👤</span> Edit Profile</button>' +
      '</div>' +
    '</div>' +
  '</div>' +
  profileCardHtml(user) +
  '<div class="stats-grid">' +
    statCard('🎓', programs.length, 'Programs run') +
    statCard('🤝', accepted, 'Active mentees') +
    statCard('⏳', pending, 'Pending requests') +
    statCard('📅', events.length, 'Events organized') +
  '</div>';
}

/* =========================================================
   ACADEMICIAN: PROGRAMS
========================================================= */
async function renderProgramsView(user){
  var all = (await api.listPrograms()).programs;
  var mine = all.filter(function(p){ return p.academicianId===user.id; });
  var others = all.filter(function(p){ return p.academicianId!==user.id; });

  var mineHtml = mine.length ? mine.map(function(p){
    return '<div class="project-card"><div class="project-content"><div class="project-title-row"><h3>' + escapeHtml(p.title) + '</h3><span class="project-status">' + escapeHtml(p.type) + '</span></div><p>' + escapeHtml(p.description) + '</p><p style="color:#9ca3af;font-size:12.5px;margin-top:8px;">' + fmtDate(p.startDate) + ' – ' + fmtDate(p.endDate) + ' · Eligibility: ' + escapeHtml(p.eligibility) + ' · ' + (p.interested||[]).length + ' interested</p></div><button class="remove-project" onclick="removeProgram(\'' + p.id + '\')">×</button></div>';
  }).join('') : '<p class="empty-message">You haven\'t created any programs yet.</p>';

  var othersHtml = others.length ? others.map(function(p){
    var interested = (p.interested||[]).indexOf(user.id)>-1;
    return '<div class="education-card"><div class="education-icon">🎓</div><div style="flex:1;min-width:200px;"><h3>' + escapeHtml(p.title) + '</h3><p>' + escapeHtml(p.academicianName) + ' · ' + escapeHtml(p.type) + '</p></div><button class="small-btn ' + (interested?'':'go') + '" onclick="toggleProgramInterest(\'' + p.id + '\')">' + (interested?'Remove':"I'm Interested") + '</button></div>';
  }).join('') : '';

  return '' +
  '<div class="dashboard-section"><div class="section-heading"><div><h2>Create a program</h2><p>FDPs, industrial training, consultancy, or collaborative projects.</p></div></div>' +
    '<form onsubmit="return createProgram(event)">' +
      '<div class="profile-form">' +
        '<div class="form-group"><label>Title</label><input type="text" name="title" required></div>' +
        '<div class="form-group"><label>Type</label><select name="type"><option>FDP</option><option>Internship</option><option>Consultancy</option><option>Collaborative Project</option></select></div>' +
        '<div class="form-group full-width"><label>Description</label><textarea name="description"></textarea></div>' +
        '<div class="form-group"><label>Eligibility</label><input type="text" name="eligibility" placeholder="Who can join?"></div>' +
        '<div class="form-group"><label>Start Date</label><input type="date" name="startDate"></div>' +
        '<div class="form-group"><label>End Date</label><input type="date" name="endDate"></div>' +
      '</div>' +
      '<div class="profile-actions"><button type="submit" class="primary-btn save-profile">Create Program</button></div>' +
    '</form>' +
  '</div>' +
  '<div class="dashboard-section"><div class="section-heading"><div><h2>My programs</h2></div></div><div class="projects-list">' + mineHtml + '</div></div>' +
  (othersHtml ? '<div class="dashboard-section"><div class="section-heading"><div><h2>Other programs</h2></div></div>' + othersHtml + '</div>' : '');
}

async function createProgram(e){
  e.preventDefault();
  var f = new FormData(e.target);
  await guarded(async function(){
    await api.createProgram({
      title: f.get('title'), type: f.get('type'), description: f.get('description'),
      eligibility: f.get('eligibility'), startDate: f.get('startDate'), endDate: f.get('endDate')
    });
    showToast('Program created.');
    await render();
  });
  return false;
}
async function removeProgram(id){
  await guarded(async function(){
    await api.deleteProgram(id);
    await render();
  });
}
async function toggleProgramInterest(id){
  await guarded(async function(){
    await api.toggleProgramInterest(id);
    await render();
  });
}

/* =========================================================
   INDUSTRY: DASHBOARD
========================================================= */
async function industryDashboard(user){
  var myOpps = (await api.myOpportunities()).opportunities;
  var apps = [];
  for(var i=0;i<myOpps.length;i++){
    var res = await api.applicantsFor(myOpps[i].id);
    apps = apps.concat(res.applicants);
  }
  var selected = apps.filter(function(a){ return a.status==='Selected'; }).length;

  var suggestions = [];
  for(var j=0;j<myOpps.length;j++){
    var s = await api.suggestedCandidates(myOpps[j].id);
    s.candidates.slice(0,2).forEach(function(c){ suggestions.push({opp:myOpps[j], student:c.student, match:c.match}); });
  }
  suggestions.sort(function(a,b){ return b.match-a.match; });
  var suggHtml = suggestions.length ? suggestions.slice(0,4).map(function(x){
    return '<div class="education-card"><div class="education-icon">🌟</div><div style="flex:1;min-width:200px;"><h3>' + escapeHtml(x.student.name) + '</h3><p>Strong fit for "' + escapeHtml(x.opp.title) + '"</p></div><div class="match-score ' + matchClass(x.match) + '">' + x.match + '%<small>match</small></div></div>';
  }).join('') : '<p class="empty-message">Post an opportunity with required skills to see suggested candidates here.</p>';

  var mentorships = (await api.mentorshipInbox()).mentorships;
  var activeMentees = mentorships.filter(function(m){ return m.status==='accepted'; }).length;

  return '' +
  renderEngagementMatrix({
    title: 'Talent Pool Engagement Matrix',
    subtitle: 'Weekly hourly candidate activity and submission distribution',
    badge: 'PEAK: 2 PM - 6 PM'
  }) +
  '<div class="two-col">' +
    renderSkillVelocity({
      title: 'Candidate Skill Acquisition Velocity',
      subtitle: 'Applicant study and benchmark readiness across tech stacks',
      badge: '5 DAYS GOAL MET'
    }) +
    '<div class="dashboard-section"><div class="section-heading"><div><h2>Suggested candidates</h2><p>Students who closely match your open postings.</p></div></div>' + suggHtml + '</div>' +
  '</div>' +
  profileCardHtml(user) +
  '<div class="stats-grid">' +
    statCard('📢', myOpps.length, 'Opportunities posted') +
    statCard('📨', apps.length, 'Total applicants') +
    statCard('✅', selected, 'Selected') +
    statCard('🤝', activeMentees, 'Active mentees') +
  '</div>' +
  '<div class="dashboard-section"><div class="section-heading"><div><h2>Quick actions</h2></div></div>' +
    '<div class="quick-actions">' +
      '<button onclick="setView(\'opportunities\')"><span>📢</span> Post Opportunity</button>' +
      '<button onclick="setView(\'applicants\')"><span>📋</span> View Applicants</button>' +
      '<button onclick="setView(\'mentorship\')"><span>🤝</span> Mentorship Requests</button>' +
      '<button onclick="setView(\'profile\')"><span>👤</span> Edit Profile</button>' +
    '</div>' +
  '</div>';
}

/* =========================================================
   INDUSTRY: OPPORTUNITIES (POST/MANAGE)
========================================================= */
async function renderOpportunitiesManage(user){
  var datalist = '<datalist id="skill-suggestions">' + MASTER_SKILLS.map(function(s){ return '<option value="' + escapeHtml(s) + '">'; }).join('') + '</datalist>';
  var mine = (await api.myOpportunities()).opportunities;
  var list = mine.length ? mine.map(function(o){
    return '<div class="job-card"><div class="job-card-header"><div><h3>' + escapeHtml(o.title) + '</h3><p>' + escapeHtml(o.type) + ' · Deadline ' + fmtDate(o.deadline) + '</p></div><button class="remove-project" onclick="removeOpportunity(\'' + o.id + '\')" style="width:32px;height:32px;">×</button></div>' +
      '<div class="job-match-text">' + escapeHtml(o.description) + '</div>' +
      '<div class="job-skills">' + (o.requiredSkills||[]).map(function(s){return '<span class="skill-tag">'+escapeHtml(s)+'</span>';}).join('') + '</div>' +
      '<p class="job-location">' + o.applicantCount + ' applicant' + (o.applicantCount===1?'':'s') + '</p>' +
      '<button class="primary-btn" onclick="viewApplicantsFor(\'' + o.id + '\')">View Applicants</button>' +
    '</div>';
  }).join('') : '<p class="empty-message">You haven\'t posted any opportunities yet.</p>';

  return '' +
  datalist +
  '<div class="dashboard-section"><div class="section-heading"><div><h2>Post a new opportunity</h2></div></div>' +
    '<form onsubmit="return postOpportunity(event)">' +
      '<div class="profile-form">' +
        '<div class="form-group"><label>Title</label><input type="text" name="title" required placeholder="e.g. Frontend Developer Intern"></div>' +
        '<div class="form-group"><label>Type</label><select name="type"><option>Internship</option><option>Job</option><option>Training</option></select></div>' +
        '<div class="form-group full-width"><label>Description</label><textarea name="description" required></textarea></div>' +
        '<div class="form-group full-width"><label>Required Skills (comma separated)</label><input type="text" name="skills" list="skill-suggestions" placeholder="JavaScript, React, Communication"></div>' +
        '<div class="form-group"><label>Application Deadline</label><input type="date" name="deadline" required></div>' +
      '</div>' +
      '<div class="profile-actions"><button type="submit" class="primary-btn save-profile">Post Opportunity</button></div>' +
    '</form>' +
  '</div>' +
  '<div class="dashboard-section"><div class="section-heading"><div><h2>My postings</h2></div></div><div class="jobs-grid">' + list + '</div></div>';
}

async function postOpportunity(e){
  e.preventDefault();
  var f = new FormData(e.target);
  await guarded(async function(){
    await api.postOpportunity({
      title: f.get('title'), type: f.get('type'), description: f.get('description'),
      requiredSkills: f.get('skills'), deadline: f.get('deadline')
    });
    showToast('Opportunity posted.');
    await render();
  });
  return false;
}
async function removeOpportunity(id){
  await guarded(async function(){
    await api.deleteOpportunity(id);
    await render();
  });
}
async function viewApplicantsFor(oppId){
  ui.selectedOpportunityForApplicants = oppId;
  await setView('applicants');
}

/* =========================================================
   INDUSTRY: APPLICANTS
========================================================= */
async function renderApplicantsView(user){
  var mine = (await api.myOpportunities()).opportunities;
  if(!mine.length) return '<div class="dashboard-section"><p class="empty-message">Post an opportunity first to start receiving applicants.</p></div>';

  var sel = ui.selectedOpportunityForApplicants;
  if(sel!=='all' && !mine.some(function(o){return o.id===sel;})) sel='all';

  var options = '<option value="all">All opportunities</option>' + mine.map(function(o){
    return '<option value="' + o.id + '" ' + (sel===o.id?'selected':'') + '>' + escapeHtml(o.title) + '</option>';
  }).join('');

  var targetOpps = sel==='all' ? mine : mine.filter(function(o){ return o.id===sel; });
  var rows = [];
  for(var i=0;i<targetOpps.length;i++){
    var res = await api.applicantsFor(targetOpps[i].id);
    res.applicants.forEach(function(a){
      rows.push({ a:a, oppTitle: res.opportunity.title });
    });
  }

  var rowsHtml = rows.length ? rows.map(function(r){
    var a = r.a, student = a.student;
    return '<tr>' +
      '<td>' + escapeHtml(student?student.name:'Unknown') + '</td>' +
      '<td>' + escapeHtml(r.oppTitle) + '</td>' +
      '<td>' + a.match + '%</td>' +
      '<td>' + escapeHtml(student?student.email:'') + '</td>' +
      '<td><select onchange="updateApplicationStatus(\'' + a.id + '\', this.value)">' +
        ['Applied','Shortlisted','Selected','Rejected'].map(function(s){ return '<option ' + (a.status===s?'selected':'') + '>' + s + '</option>'; }).join('') +
      '</select></td>' +
    '</tr>';
  }).join('') : '<tr><td colspan="5" class="empty-message">No applicants yet.</td></tr>';

  return '' +
  '<div class="filter-bar"><select onchange="ui.selectedOpportunityForApplicants=this.value; renderContentOnly();">' + options + '</select></div>' +
  '<div class="dashboard-section"><div class="table-wrap"><table class="data-table"><tr><th>Candidate</th><th>Opportunity</th><th>Match</th><th>Email</th><th>Status</th></tr>' + rowsHtml + '</table></div></div>';
}

async function updateApplicationStatus(appId, status){
  await guarded(async function(){
    await api.updateApplicationStatus(appId, status);
    showToast('Status updated to ' + status + '.');
    await render();
  });
}

/* =========================================================
   ADMIN: DASHBOARD
========================================================= */
async function adminDashboard(user){
  var summary = await api.analyticsSummary();
  var skills = await api.analyticsSkills();

  var funnel = [
    {label:'Applications', val: summary.funnel.applied},
    {label:'Shortlisted', val: summary.funnel.shortlisted},
    {label:'Selected', val: summary.funnel.selected}
  ];
  var max = Math.max(summary.funnel.applied, 1);
  var funnelHtml = funnel.map(function(f){
    var pct = Math.round(f.val/max*100);
    return '<div class="skill-bar-row"><div class="bar-label"><span>' + f.label + '</span><span>' + f.val + '</span></div><div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div></div>';
  }).join('');

  var topSkills = skills.demand.slice(0,5);
  var topSkillsHtml = topSkills.length ? topSkills.map(function(s){
    var pct = Math.round(s.count/topSkills[0].count*100);
    return '<div class="skill-bar-row"><div class="bar-label"><span>' + escapeHtml(s.name) + '</span><span>' + s.count + ' posting' + (s.count===1?'':'s') + '</span></div><div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div></div>';
  }).join('') : '<p class="empty-message">No opportunities posted yet.</p>';

  return '' +
  '<div class="stats-grid">' +
    statCardStar(summary.funnel.shortlisted || 1, 'Shortlisted') +
    statCard('🎓', summary.students, 'Students') +
    statCard('🧑‍🏫', summary.academicians, 'Academicians') +
    statCard('🏢', summary.industries, 'Industry partners') +
  '</div>' +
  renderEngagementMatrix({
    title: 'Platform Student Engagement Matrix',
    subtitle: 'Weekly hourly activity distribution',
    badge: 'PEAK: 2 PM - 6 PM'
  }) +
  '<div class="two-col">' +
    renderSkillVelocity() +
    '<div class="dashboard-section"><div class="section-heading"><div><h2>Placement funnel</h2></div></div>' + funnelHtml + '</div>' +
  '</div>' +
  '<div class="dashboard-section"><div class="section-heading"><div><h2>Top in-demand skills</h2></div></div>' + topSkillsHtml + '</div>' +
  '<div class="dashboard-section"><div class="section-heading"><div><h2>Quick actions</h2></div></div>' +
    '<div class="quick-actions">' +
      '<button onclick="setView(\'users\')"><span>👥</span> View Users</button>' +
      '<button onclick="setView(\'opportunities\')"><span>📢</span> View Opportunities</button>' +
      '<button onclick="setView(\'analytics\')"><span>📊</span> Full Analytics</button>' +
      '<button onclick="exportUsersCsv()"><span>⬇️</span> Export Users</button>' +
    '</div>' +
  '</div>';
}

/* =========================================================
   ADMIN: USERS
========================================================= */
async function renderUsersView(user){
  var roleFilter = ui.userRoleFilter||'';
  var params = {};
  if(roleFilter) params.role = roleFilter;
  if(ui.userSearch) params.q = ui.userSearch;
  var list = (await api.listUsers(params)).users;

  var rows = list.length ? list.map(function(u){
    var org = u.orgName || u.institution || '—';
    var detail = u.role==='student' ? (u.skills||[]).length + ' skills' : (u.role==='industry' ? '—' : (u.role==='academician' ? '—' : '—'));
    return '<tr><td>' + escapeHtml(u.name) + '</td><td>' + escapeHtml(u.email) + '</td><td><span class="role-badge ' + u.role + '">' + ROLE_LABEL[u.role] + '</span></td><td>' + escapeHtml(org) + '</td><td>' + detail + '</td></tr>';
  }).join('') : '<tr><td colspan="5" class="empty-message">No users match your filters.</td></tr>';

  return '' +
  '<div class="filter-bar">' +
    '<input type="text" placeholder="Search by name or email..." value="' + escapeHtml(ui.userSearch||'') + '" oninput="ui.userSearch=this.value; renderContentOnly();">' +
    '<select onchange="ui.userRoleFilter=this.value; renderContentOnly();">' +
      '<option value="">All roles</option>' +
      '<option value="student" ' + (roleFilter==='student'?'selected':'') + '>Student</option>' +
      '<option value="academician" ' + (roleFilter==='academician'?'selected':'') + '>Academician</option>' +
      '<option value="industry" ' + (roleFilter==='industry'?'selected':'') + '>Industry</option>' +
      '<option value="admin" ' + (roleFilter==='admin'?'selected':'') + '>Admin</option>' +
    '</select>' +
  '</div>' +
  '<div class="dashboard-section"><div class="table-wrap"><table class="data-table"><tr><th>Name</th><th>Email</th><th>Role</th><th>Institution/Org</th><th>Detail</th></tr>' + rows + '</table></div></div>';
}

async function exportUsersCsv(){
  await guarded(async function(){
    var csv = await api.exportUsersCsv();
    if(navigator.clipboard && navigator.clipboard.writeText){
      await navigator.clipboard.writeText(csv);
      showToast('User list copied as CSV.');
    } else {
      showToast('Clipboard not available in this browser.');
    }
  });
}

/* =========================================================
   ADMIN: OPPORTUNITIES OVERVIEW
========================================================= */
async function renderAdminOpportunities(user){
  var opps = (await api.listOpportunities()).opportunities;
  var rows = opps.length ? opps.map(function(o){
    return '<tr><td>' + escapeHtml(o.title) + '</td><td>' + escapeHtml(o.industryName) + '</td><td>' + escapeHtml(o.type) + '</td><td>' + (o.requiredSkills||[]).join(', ') + '</td><td>' + fmtDate(o.deadline) + '</td><td>' + o.applicantCount + '</td></tr>';
  }).join('') : '<tr><td colspan="6" class="empty-message">No opportunities posted yet.</td></tr>';

  return '<div class="dashboard-section"><div class="table-wrap"><table class="data-table"><tr><th>Title</th><th>Industry</th><th>Type</th><th>Required Skills</th><th>Deadline</th><th>Applicants</th></tr>' + rows + '</table></div></div>';
}

/* =========================================================
   ADMIN: ANALYTICS
========================================================= */
async function renderAnalyticsView(user){
  var summary = await api.analyticsSummary();
  var skills = await api.analyticsSkills();

  var supplyHtml = skills.supply.length ? skills.supply.slice(0,8).map(function(s){
    var pct = Math.round(s.count/skills.supply[0].count*100);
    return '<div class="skill-bar-row"><div class="bar-label"><span>' + escapeHtml(s.name) + '</span><span>' + s.count + '</span></div><div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div></div>';
  }).join('') : '<p class="empty-message">No student skill data yet.</p>';

  var appsByStatus = summary.applicationsByStatus || {};
  var statusHtml = Object.keys(appsByStatus).length ? Object.keys(appsByStatus).map(function(s){
    return '<div class="stat-card"><span>📌</span><h3>' + appsByStatus[s] + '</h3><p>' + s + '</p></div>';
  }).join('') : '<p class="empty-message">No applications yet.</p>';

  return '' +
  '<div class="stats-grid">' +
    statCardStar(summary.funnel.shortlisted || 1, 'Shortlisted') +
    statCard('📨', summary.funnel.applied, 'Applications') +
    statCard('✅', summary.funnel.selected, 'Selected') +
    statCard('📢', summary.opportunities, 'Opportunities') +
  '</div>' +
  renderEngagementMatrix({
    title: 'Platform Student Engagement Matrix',
    subtitle: 'Weekly hourly activity distribution',
    badge: 'PEAK: 2 PM - 6 PM'
  }) +
  '<div class="two-col">' +
    renderSkillVelocity() +
    renderSkillDemandCard(skills) +
  '</div>' +
  '<div class="dashboard-section"><div class="section-heading"><div><h2>Skill supply</h2><p>Most common skills among students.</p></div></div>' + supplyHtml + '</div>';
}

/* =========================================================
   INIT
========================================================= */
(async function init(){
  var token = getToken();
  if(token){
    try{
      var res = await api.me();
      session.user = res.user;
    }catch(err){
      setToken(null);
    }
  }
  render();
})();
