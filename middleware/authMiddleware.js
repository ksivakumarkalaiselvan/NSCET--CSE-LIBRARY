const jwt = require('jsonwebtoken');
const config = require('../config/config');

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing or invalid format. Please log in.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.'
    });
  }
}

// Optional auth middleware for endpoints that can be public or enriched if logged in
function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
    }
  } catch (err) {
    // Ignore error for optional auth
  }
  next();
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
