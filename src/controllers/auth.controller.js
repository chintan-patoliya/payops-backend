const httpStatus = require('http-status');
const User = require('../models/user.model');
const APIError = require('../utils/APIError');
const { ERROR_MESSAGES, formatMessage } = require('../constants/messages');

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new APIError({
        message: formatMessage(ERROR_MESSAGES.REQUIRED_FIELD, { field: 'Email and password' }),
        status: httpStatus.BAD_REQUEST,
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new APIError({
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
        status: httpStatus.UNAUTHORIZED,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new APIError({
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
        status: httpStatus.UNAUTHORIZED,
      });
    }

    const token = user.generateToken();

    res.json({
      success: true,
      data: {
        token,
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};
