class APIError extends Error {
  constructor({ message, status = 500, isPublic = true }) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    this.isPublic = isPublic;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = APIError;
