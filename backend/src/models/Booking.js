const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senior: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    date: Date,
    timeSlot: String,

    startTime: Date,
    endTime: Date,
    meetLink: String,

    // 🔥 CALL FLOW
    isCallStarted: {
      type: Boolean,
      default: false,
    },

    actualStartTime: Date,

    isSeniorMarkedDone: {
      type: Boolean,
      default: false,
    },

    isStudentConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);