const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema(
  {
    senior: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    upiId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Create indexes for faster queries
withdrawSchema.index({ senior: 1 });
withdrawSchema.index({ status: 1 });

module.exports = mongoose.model("Withdraw", withdrawSchema);