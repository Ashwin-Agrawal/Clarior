const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendSuccess, sendError, sendBadRequest } = require("../utils/response.util");
const AuthService = require("../services/auth.service");

// 🔐 ERROR MESSAGES MAPPING
const ERROR_MESSAGES = {
  USER_EXISTS: "This email is already registered",
  SENIOR_INCOMPLETE_DATA: "Phone, college, and branch are required for mentor registration",
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_NOT_FOUND: "User not found",
};

const isProd = process.env.NODE_ENV === "production";
const authCookieOptions = {
  httpOnly: true,
  secure: isProd,
  // Cross-site frontend (Vercel) + backend (Render) requires SameSite=None in prod.
  sameSite: isProd ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};

// 🔐 REGISTER
exports.register = async (req, res) => {      
  try {
    const { name, email, phone, password, role, college, domain, branch, year, cgpa, bio, linkedin } = req.body;

    // Call service
    const user = await AuthService.registerUser({
      name,
      email,
      phone,
      password,
      role,
      college,
      domain,
      branch,
      year,
      cgpa,
      bio,
      linkedin,
    });

    return sendSuccess(res, "Registration successful. Please log in.", { user }, 201);
  } catch (error) {
    const errorMessage = ERROR_MESSAGES[error.message] || error.message;
    return sendBadRequest(res, errorMessage);
  }
};

// 🔐 LOGIN (UPDATED SAFE RESPONSE)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Call service
    const { token, user } = await AuthService.loginUser(email, password);

    // ✅ SET HTTP-ONLY COOKIE
    res.cookie("token", token, authCookieOptions);

    return sendSuccess(res, "Login successful", { user });
  } catch (error) {
    const errorMessage = ERROR_MESSAGES[error.message] || error.message;
    return sendBadRequest(res, errorMessage);
  }
};
// 🔐 LOGOUT
exports.logout = async (req, res) => {
  try {
    // Clear with same options to ensure browser removes cookie reliably.
    res.clearCookie("token", authCookieOptions);
    return sendSuccess(res, "Logged out successfully");
  } catch (error) {
    return sendError(res, error.message);
  }
};