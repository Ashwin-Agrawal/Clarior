// 🔥 STANDARDIZED API RESPONSE UTILITY
const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message,
    ...(data && { data })
  };

  return res.status(statusCode).json(response);
};

// ✅ SUCCESS RESPONSES
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return sendResponse(res, statusCode, true, message, data);
};

// ❌ ERROR RESPONSES
const sendError = (res, message, statusCode = 500, data = null) => {
  return sendResponse(res, statusCode, false, message, data);
};

// 🔐 UNAUTHORIZED
const sendUnauthorized = (res, message = "Unauthorized access") => {
  return sendError(res, message, 401);
};

// 🚫 FORBIDDEN
const sendForbidden = (res, message = "Access forbidden") => {
  return sendError(res, message, 403);
};

// 📭 NOT FOUND
const sendNotFound = (res, message = "Resource not found") => {
  return sendError(res, message, 404);
};

// ⚠️ BAD REQUEST
const sendBadRequest = (res, message = "Bad request") => {
  return sendError(res, message, 400);
};

module.exports = {
  sendSuccess,
  sendError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendBadRequest
};