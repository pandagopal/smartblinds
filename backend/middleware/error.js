const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  console.error('[ErrorMiddleware] Error caught by error handler:');
  console.error(err);

  let error = { ...err };
  error.message = err.message;

  console.log(`[ErrorMiddleware] Error name: ${err.name}`);

  // Log the request details that caused the error
  console.log(`[ErrorMiddleware] Request method: ${req.method}`);
  console.log(`[ErrorMiddleware] Request URL: ${req.originalUrl}`);
  console.log(`[ErrorMiddleware] Request body:`, JSON.stringify(req.body, null, 2));

  // Let's log the stack trace for debugging
  console.error('[ErrorMiddleware] Stack trace:', err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  // SQL errors
  if (err.code === '23505') {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Create a sanitized error response that's safe to send to the client
  const response = {
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  console.log(`[ErrorMiddleware] Sending error response: ${JSON.stringify(response, null, 2)}`);

  res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;
