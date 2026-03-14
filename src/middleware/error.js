const httpStatus = require('http-status');
const APIError = require('../utils/APIError');
const { env } = require('../config/vars');

/**
 * Convert non-APIError to APIError
 */
const errorConverter = (err, req, res, next) => {
  let convertedError = err;

  if (!(err instanceof APIError)) {
    convertedError = new APIError({
      message: err.message,
      status: err.status || httpStatus.INTERNAL_SERVER_ERROR,
    });
  }

  return errorHandler(convertedError, req, res, next);
};

/**
 * Catch 404 and forward to error handler
 */
const notFound = (req, res, next) => {
  const err = new APIError({
    message: 'API endpoint not found',
    status: httpStatus.NOT_FOUND,
  });
  return errorHandler(err, req, res, next);
};

/**
 * Error handler - sends consistent error response
 */
const errorHandler = (err, req, res, next) => {
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    ...(env === 'development' && { stack: err.stack }),
  };

  console.error(`[ERROR] ${err.status || 500} - ${err.message}`);

  res.status(err.status || 500).json(response);
};

module.exports = { errorConverter, notFound, errorHandler };
