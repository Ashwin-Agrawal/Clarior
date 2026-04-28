/**
 * 🔥 GLOBAL ERROR HANDLING MIDDLEWARE
 * Catches and standardizes all errors across the application
 */

const { sendError } = require("../utils/response.util");

const globalErrorHandler = (err, req, res, next) => {
  // 🔒 Log error internally but don't expose sensitive details
  console.error("[ERROR]", err);

  // 🔥 MONGOOSE VALIDATION ERROR
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
    return sendError(res, `Validation error: ${messages}`, 400);
  }

  // 🔥 MONGOOSE CAST ERROR (Invalid ObjectId)
  if (err.name === "CastError") {
    return sendError(res, "Invalid resource ID format", 400);
  }

  // 🔥 MONGOOSE DUPLICATE KEY ERROR
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, `This ${field} is already registered`, 400);
  }

  // 🔥 JWT ERRORS
  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Invalid authentication token", 401);
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, "Authentication token has expired", 401);
  }

  // 🔥 CUSTOM ERRORS
  if (err.statusCode) {
    return sendError(res, err.message, err.statusCode);
  }

  // 🔥 DEFAULT ERROR - Don't expose stack trace in production
  const statusCode = err.statusCode || 500;
  let message = "Internal server error";
  
  // Only expose detailed errors in development
  if (process.env.NODE_ENV !== "production" && err.message) {
    message = err.message;
  }
  
  return sendError(res, message, statusCode);
};

module.exports = globalErrorHandler;