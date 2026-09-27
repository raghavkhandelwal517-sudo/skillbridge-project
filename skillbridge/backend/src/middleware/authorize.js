// Usage: router.post('/x', authenticate, authorize('industry', 'admin'), handler)
module.exports = function authorize(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to do that.' });
    }
    next();
  };
};
