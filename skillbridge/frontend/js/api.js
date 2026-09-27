// Thin wrapper around fetch() for talking to the SkillBridge backend.
// The server serves this same frontend, so relative URLs just work —
// change BASE_URL if you ever split the frontend onto a different origin.

var BASE_URL = '/api';
var TOKEN_KEY = 'skillbridge_token';

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(t) { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); }

async function request(method, path, body) {
  var headers = { 'Content-Type': 'application/json' };
  var token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  var res = await fetch(BASE_URL + path, {
    method: method,
    headers: headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (res.status === 204) return null;

  var contentType = res.headers.get('content-type') || '';
  var data = contentType.indexOf('application/json') > -1 ? await res.json() : await res.text();

  if (!res.ok) {
    var message = (data && data.error) ? data.error : 'Request failed (' + res.status + ').';
    throw new Error(message);
  }
  return data;
}

var api = {
  // auth
  register: function (payload) { return request('POST', '/auth/register', payload); },
  login: function (email, password) { return request('POST', '/auth/login', { email: email, password: password }); },
  me: function () { return request('GET', '/auth/me'); },

  // profile
  updateProfile: function (payload) { return request('PUT', '/users/me', payload); },
  toggleMentor: function () { return request('PUT', '/users/me/mentor'); },
  addSkill: function (name, level) { return request('POST', '/users/me/skills', { name: name, level: level }); },
  removeSkill: function (name) { return request('DELETE', '/users/me/skills/' + encodeURIComponent(name)); },
  addProject: function (payload) { return request('POST', '/users/me/projects', payload); },
  removeProject: function (id) { return request('DELETE', '/users/me/projects/' + id); },
  addListItem: function (field, item) { return request('POST', '/users/me/' + field, { item: item }); },
  removeListItem: function (field, index) { return request('DELETE', '/users/me/' + field + '/' + index); },

  // mentors / mentorship
  listMentors: function () { return request('GET', '/users/mentors'); },
  requestMentorship: function (mentorId) { return request('POST', '/mentorships', { mentorId: mentorId }); },
  myMentorships: function () { return request('GET', '/mentorships/mine'); },
  mentorshipInbox: function () { return request('GET', '/mentorships/requests'); },
  respondMentorship: function (id, status) { return request('PUT', '/mentorships/' + id + '/status', { status: status }); },
  submitMentorFeedback: function (id, feedback) { return request('PUT', '/mentorships/' + id + '/feedback', { feedback: feedback }); },

  // assessments
  submitAssessment: function (scores) { return request('POST', '/assessments/me', { scores: scores }); },
  myAssessments: function () { return request('GET', '/assessments/me'); },

  // opportunities
  listOpportunities: function (params) {
    var qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('GET', '/opportunities' + qs);
  },
  myOpportunities: function () { return request('GET', '/opportunities/mine'); },
  postOpportunity: function (payload) { return request('POST', '/opportunities', payload); },
  deleteOpportunity: function (id) { return request('DELETE', '/opportunities/' + id); },
  applyToOpportunity: function (id) { return request('POST', '/opportunities/' + id + '/apply'); },
  applicantsFor: function (id) { return request('GET', '/opportunities/' + id + '/applicants'); },
  suggestedCandidates: function (id) { return request('GET', '/opportunities/' + id + '/suggested'); },
  myApplications: function () { return request('GET', '/applications/me'); },
  updateApplicationStatus: function (id, status) { return request('PUT', '/applications/' + id + '/status', { status: status }); },

  // programs
  listPrograms: function () { return request('GET', '/programs'); },
  createProgram: function (payload) { return request('POST', '/programs', payload); },
  deleteProgram: function (id) { return request('DELETE', '/programs/' + id); },
  toggleProgramInterest: function (id) { return request('POST', '/programs/' + id + '/interest'); },

  // events
  listEvents: function () { return request('GET', '/events'); },
  createEvent: function (payload) { return request('POST', '/events', payload); },
  rsvpEvent: function (id) { return request('POST', '/events/' + id + '/rsvp'); },

  // admin
  listUsers: function (params) {
    var qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('GET', '/users' + qs);
  },
  exportUsersCsv: function () { return request('GET', '/users/export.csv'); },
  analyticsSummary: function () { return request('GET', '/analytics/summary'); },
  analyticsSkills: function () { return request('GET', '/analytics/skills'); }
};
