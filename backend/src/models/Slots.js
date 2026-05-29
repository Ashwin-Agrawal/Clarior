const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    senior: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String, // "5PM-6PM"
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    dateTime: { type: Date }
  },
  { timestamps: true }
);

// Create indexes for faster queries
slotSchema.index({ senior: 1 });
slotSchema.index({ isBooked: 1 });
slotSchema.index({ date: 1 });
slotSchema.index({ senior: 1, date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model("Slot", slotSchema);