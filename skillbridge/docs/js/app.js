/* SkillBridge frontend controller. */
var session = { user: null, view: 'dashboard' };
var TOKEN_KEY = 'skillbridge_token';
var roles = {
  student: [['dashboard','Dashboard'],['profile','Profile'],['opportunities','Opportunities'],['mentorship','Mentorship'],['events','Events'],['portfolio','Portfolio']],
  academician: [['dashboard','Dashboard'],['profile','Profile'],['programs','Programs'],['mentorship','Mentorship'],['events','Events']],
  industry: [['dashboard','Dashboard'],['profile','Profile'],['opportunities','Opportunities'],['applicants','Applicants'],['mentorship','Mentorship'],['events','Events']],
  admin: [['dashboard','Dashboard'],['users','Users'],['opportunities','Opportunities'],['analytics','Analytics'],['events','Events']]
};

function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function(c) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
function toast(message) {
  var el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  setTimeout(function () { el.classList.remove('show'); }, 2500);
}
function logout() { localStorage.removeItem(TOKEN_KEY); session.user = null; session.view = 'dashboard'; render(); }
async function setView(view) { session.view = view; await render(); }

function authView() {
  return '<div class="auth-page"><div class="auth-shell single"><div class="auth-card">' +
    '<h1>Welcome to SkillBridge</h1><p class="auth-subtitle">Log in to continue.</p>' +
    '<form onsubmit="return login(event)"><label>Email</label><input name="email" type="email" required placeholder="aditi@student.edu">' +
    '<label>Password</label><input name="password" type="password" required placeholder="demo123">' +
    '<button class="auth-button" type="submit">Log in</button></form>' +
    '<p class="auth-footer">Demo password: <strong>demo123</strong></p></div></div></div>';
}
async function login(event) {
  event.preventDefault();
  var form = new FormData(event.target);
  try {
    var result = await api.login(form.get('email'), form.get('password'));
    localStorage.setItem(TOKEN_KEY, result.token);
    session.user = result.user;
    session.view = 'dashboard';
    await render();
  } catch (error) { toast(error.message); }
  return false;
}

async function render() {
  var root = document.getElementById('app');
  if (!session.user) { root.innerHTML = authView(); return; }
  var nav = (roles[session.user.role] || roles.student).map(function(item) {
    return '<button class="' + (session.view === item[0] ? 'active' : '') + '" onclick="setView(\'' + item[0] + '\')">' + esc(item[1]) + '</button>';
  }).join('');
  root.innerHTML = '<div class="dashboard-page"><aside class="sidebar"><div class="logo"><img class="brand-logo" src="assets/logo.jpeg" alt="SkillBridge"></div><nav>' + nav + '</nav><button class="logout-button" onclick="logout()">Log out</button></aside><main class="dashboard-main"><div class="dashboard-header"><div><h1>' + esc(session.view) + '</h1><p>Welcome back, ' + esc(session.user.name) + '.</p></div></div><div id="view-content"><p class="empty-message">Loading…</p></div></main></div>';
  await renderContentOnly();
}
async function renderContentOnly() {
  var target = document.getElementById('view-content');
  if (!target) return;
  try { target.innerHTML = await viewHtml(); }
  catch (error) { target.innerHTML = '<p class="auth-error">' + esc(error.message) + '</p>'; }
}
function section(title, body) { return '<div class="dashboard-section"><div class="section-heading"><div><h2>' + title + '</h2></div></div>' + body + '</div>'; }
async function viewHtml() {
  var user = session.user;
  if (session.view === 'events') return eventsView(user);
  if (session.view === 'profile') return section('Profile', '<p><strong>' + esc(user.name) + '</strong><br>' + esc(user.email) + '</p>');
  if (session.view === 'opportunities') return section('Opportunities', '<p>Opportunity tools are available through the API.</p>');
  if (session.view === 'mentorship') return section('Mentorship', '<p>Mentorship tools are available through the API.</p>');
  if (session.view === 'programs') return section('Programs', '<p>Programs tools are available through the API.</p>');
  if (session.view === 'users' || session.view === 'analytics' || session.view === 'applicants') return section(session.view, '<p>Loading data for this section is available after authentication.</p>');
  return section('Dashboard', '<p>Select a section from the navigation to continue.</p>');
}
async function eventsView(user) {
  var data = await api.listEvents();
  var icons = {Workshop:'🛠️', GuestLecture:'🎤', Challenge:'🏆'};
  var list = (data.events || []).map(function(event) {
    var joined = (event.rsvps || []).indexOf(user.id) !== -1;
    return '<div class="education-card"><div class="education-icon">' + (icons[event.type] || '📅') + '</div><div style="flex:1"><h3>' + esc(event.title) + '</h3><p>' + esc(event.description || '') + '</p><p>' + esc(event.date || '') + '</p></div><button class="small-btn ' + (joined ? '' : 'go') + '" onclick="rsvpEvent(\'' + esc(event.id) + '\')">' + (joined ? 'Cancel RSVP' : 'I\'m Interested') + '</button></div>';
  }).join('') || '<p class="empty-message">No events scheduled yet.</p>';
  var canCreate = ['academician','industry','admin'].indexOf(user.role) !== -1;
  var form = canCreate ? '<form onsubmit="return createEvent(event)"><div class="profile-form"><div class="form-group"><label>Title</label><input name="title" required></div><div class="form-group"><label>Type</label><select name="type"><option>Workshop</option><option>GuestLecture</option><option>Challenge</option></select></div><div class="form-group"><label>Date</label><input name="date" type="date" required></div><div class="form-group full-width"><label>Description</label><textarea name="description"></textarea></div></div><button class="primary-btn" type="submit">Create Event</button></form>' : '';
  return form + section('Upcoming events', list);
}
async function createEvent(event) {
  event.preventDefault();
  var form = new FormData(event.target);
  try { await api.createEvent({title:form.get('title'), type:form.get('type'), date:form.get('date'), description:form.get('description')}); toast('Event created.'); await renderContentOnly(); }
  catch (error) { toast(error.message); }
  return false;
}
async function rsvpEvent(id) {
  try { await api.rsvpEvent(id); await renderContentOnly(); }
  catch (error) { toast(error.message); }
}
(async function init() {
  var token = localStorage.getItem(TOKEN_KEY);
  if (token) { try { session.user = (await api.me()).user; } catch (e) { localStorage.removeItem(TOKEN_KEY); } }
  await render();
}());
