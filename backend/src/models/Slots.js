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

module.exports = mongoose.model("Slot", slotSchema);