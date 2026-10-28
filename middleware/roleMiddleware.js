function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required.'
      });
    }

    const userRole = (req.user.role || '').toLowerCase();
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: '${req.user.role}'.`
      });
    }

    next();
  };
}

module.exports = {
  requireRole
};
