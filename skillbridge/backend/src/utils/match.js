function computeMatch(user, requiredSkills) {
  if (!requiredSkills || !requiredSkills.length) return 0;
  const userSkillNames = (user.skills || []).map((s) => s.name.toLowerCase());
  const matched = requiredSkills.filter((s) => userSkillNames.includes(s.toLowerCase()));
  return Math.round((matched.length / requiredSkills.length) * 100);
}

// Strips fields a client should never receive about another user.
function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

module.exports = { computeMatch, publicUser };
