const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error
  let error = {
    status: 500,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Supabase errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        error = {
          status: 409,
          message: 'Resource already exists',
          details: 'A record with this information already exists'
        };
        break;
      case '23503': // Foreign key violation
        error = {
          status: 400,
          message: 'Invalid reference',
          details: 'Referenced resource does not exist'
        };
        break;
      case '23502': // Not null violation
        error = {
          status: 400,
          message: 'Missing required field',
          details: 'Required field cannot be empty'
        };
        break;
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      status: 401,
      message: 'Invalid token',
      details: 'Authentication token is invalid'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      status: 401,
      message: 'Token expired',
      details: 'Authentication token has expired'
    };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error = {
      status: 400,
      message: 'Validation failed',
      details: err.message
    };
  }

  // Rate limit errors
  if (err.status === 429) {
    error = {
      status: 429,
      message: 'Too many requests',
      details: 'Please try again later'
    };
  }

  res.status(error.status).json({
    error: error.message,
    message: error.details || error.message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler
};