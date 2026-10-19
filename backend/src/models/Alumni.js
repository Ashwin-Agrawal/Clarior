const mongoose = require("mongoose");

const alumniSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    //  Academic Background
    isCollegeDropout: {
      type: Boolean,
      default: false,
    },

    college: {
      type: String,
      trim: true,
      required: function () {
        return !this.isCollegeDropout;
      },
    },

    degree: {
      type: String,
      trim: true,
      required: function () {
        return !this.isCollegeDropout;
      },
    },

    specialization: {
      type: String,
      trim: true,
      default: "", // e.g. Computer Science, AI/ML, Finance, Mechanical
    },

    graduationDate: {
      type: Date,
      required: function () {
        return !this.isCollegeDropout;
      },
    },

    //  Optional Master's Degree
    masters: {
      hasMasters: {
        type: Boolean,
        default: false,
      },
      degree: {
        type: String,
        trim: true,
        default: "",
      },
      college: {
        type: String,
        trim: true,
        default: "",
      },
      graduationYear: {
        type: Number,
        default: null,
      },
    },

    //  Professional Details
    currentJobTitle: {
      type: String,
      required: true,
      trim: true,
    },

    currentCompany: {
      type: String,
      required: true,
      trim: true,
    },

    joiningDate: {
      type: Date,
      required: true,
    },

    companyEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    //  Socials & Bio
    linkedin: {
      type: String,
      required: true,
      trim: true,
    },

    bio: {
      type: String,
      required: true,
      trim: true,
    },

    //  Payouts & Pricing
    upiId: {
      type: String,
      required: true,
      trim: true,
    },

    sessionPrice: {
      type: Number,
      required: true,
      min: 99,
      max: 9999,
    },

    sessionDuration: {
      type: Number,
      default: 20, // Fixed 20-min session
      immutable: true,
    },

    weeklySessionsLimit: {
      type: Number,
      default: 5, // How many 20-min calls they can take per week
      min: 1,
      max: 50,
    },

    platformFeePercent: {
      type: Number,
      default: 20,
      immutable: true, // Fixed 20% platform commission
    },

    //  Application Review & Approval Lifecycle
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    rejectionReason: {
      type: String,
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    //  Ratings & Performance
    rating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    sessionsCompleted: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

alumniSchema.index({ status: 1 });
alumniSchema.index({ currentCompany: 1 });
alumniSchema.index({ college: 1 });

module.exports = mongoose.model("Alumni", alumniSchema);
