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

const isProd = process.env.NODE_ENV === "production" || process.env.RENDER === "true" || process.env.RENDER === "1";
const authCookieOptions = {
  httpOnly: true,
  secure: isProd, // Must be true for SameSite=None
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

// 🔐 GOOGLE CONFIG
exports.googleConfig = async (req, res) => {
  try {
    return res.json({
      success: true,
      clientId: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 🔐 GOOGLE LOGIN / REGISTER
exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: "idToken is required" });
    }

    const { getOAuthClient } = require("../utils/googleClient");
    let oauth2Client = getOAuthClient();
    if (!oauth2Client) {
      const { google } = require("googleapis");
      oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID);
    }

    // Verify Google ID Token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user as a student (Option A)
      const crypto = require("crypto");
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "student",
        isVerified: true,
        callCredits: 0,
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set cookie
    res.cookie("token", token, authCookieOptions);

    const userObj = user.toObject();
    delete userObj.password;

    return res.json({
      success: true,
      message: "Login successful",
      user: userObj,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};