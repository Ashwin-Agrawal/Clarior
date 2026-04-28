const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["student", "senior", "admin"],
      default: "student",
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    applicationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", null],
      default: null,
    },

    // 🎓 ACADEMIC INFO
    college: {
      type: String,
    },

    domain: {
      type: String,
      trim: true,
    },

    branch: {
      type: String,
    },

    year: {
      type: Number,
    },

    cgpa: {
      type: Number,
      min: 0,
      max: 10,
    },

    // 👤 PROFILE
    bio: {
      type: String,
    },

    linkedin: {
      type: String,
    },
    collegeIdImage: String,

    isAnonymous: {
      type: Boolean,
      default: false,
    },

    // ⭐ RATING SYSTEM
    rating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    // 💰 PAYMENT (NEW)
    upiId: {
      type: String,
      default: null,
    },

    // 💰 WALLET SYSTEM (FIXED STRUCTURE)
    callCredits: {
      type: Number,
      default: 0, // for students
    },

    pendingEarnings: {
      type: Number,
      default: 0, // waiting for confirmation
    },

    availableBalance: {
      type: Number,
      default: 0, // withdrawable
    },
    payments: [
  {
    paymentId: String,
  },
],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);