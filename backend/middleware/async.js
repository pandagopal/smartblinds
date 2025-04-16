/**
 * Async middleware to handle Express async route handlers
 * This eliminates the need for try-catch blocks in controllers
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
