const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const APIError = require('../utils/APIError');
const { jwt: jwtConfig, roles } = require('../config/vars');

/**
 * Authenticate JWT token from Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new APIError({
        message: 'Authentication required. Please provide a valid token.',
        status: httpStatus.UNAUTHORIZED,
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtConfig.secret);

    const user = await User.findById(decoded.sub);
    if (!user) {
      throw new APIError({
        message: 'User not found. Token may be invalid.',
        status: httpStatus.UNAUTHORIZED,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new APIError({
        message: 'Invalid or expired token. Please login again.',
        status: httpStatus.UNAUTHORIZED,
      }));
    }
    next(error);
  }
};

/**
 * Authorize by role - RBAC enforcement (server-side)
 * @param  {...string} allowedRoles - Roles allowed to access the route
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new APIError({
      message: 'Authentication required',
      status: httpStatus.UNAUTHORIZED,
    }));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new APIError({
      message: `Access denied. Only ${allowedRoles.join(', ')} can perform this action.`,
      status: httpStatus.FORBIDDEN,
    }));
  }

  next();
};

const OPS = roles.OPS;
const FINANCE = roles.FINANCE;

module.exports = { authenticate, authorize, OPS, FINANCE };
