const mongoose = require("mongoose");

/**
 * 🔥 AUTH SERVICE - Business logic layer
 * Handles all authentication-related operations
 */

class AuthService {
  /**
   * Register a new user
   */
  static async registerUser(userData) {
    const User = require("../models/User");
    const bcrypt = require("bcryptjs");

    // Check for existing user
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("USER_EXISTS");
    }

    // Validate senior requirements
    if (userData.role === "senior") {
      if (!userData.phone || !userData.college || !userData.branch) {
        throw new Error("SENIOR_INCOMPLETE_DATA");
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const user = await User.create({
      name: userData.name,
      email: userData.email,
      phone: userData.phone || null,
      password: hashedPassword,
      role: userData.role === "senior" ? "senior" : "student",
      isVerified: userData.role === "senior" ? false : true,
      applicationStatus: userData.role === "senior" ? "pending" : null,
      college: userData.college || null,
      domain: userData.domain || null,
      branch: userData.branch || null,
      year: userData.year || null,
      cgpa: userData.cgpa || null,
      bio: userData.bio || null,
      linkedin: userData.linkedin || null,
    });

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }

  /**
   * Login user and generate JWT
   */
  static async loginUser(email, password) {
    const User = require("../models/User");
    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // 🔒 Reduced from 7 days to 24 hours
    );

    // Return token and user
    const userObj = user.toObject();
    delete userObj.password;

    return { token, user: userObj };
  }

  /**
   * Get current user
   */
  static async getCurrentUser(userId) {
    const User = require("../models/User");
    
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return user.toObject();
  }
}

module.exports = AuthService;