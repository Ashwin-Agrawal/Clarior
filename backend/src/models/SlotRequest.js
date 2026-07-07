const mongoose = require("mongoose");

const slotRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senior: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    preferredTime: {
      type: String,
      required: true,
      enum: ["morning", "afternoon", "evening"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to optimize dashboard query speeds
slotRequestSchema.index({ senior: 1, status: 1, createdAt: -1 });
slotRequestSchema.index({ student: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("SlotRequest", slotRequestSchema);
