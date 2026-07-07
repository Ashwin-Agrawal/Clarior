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
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
    },
    date: Date,
    timeSlot: String,

    startTime: Date,
    endTime: Date,
    meetLink: String,

    // 🔥 CALL FLOW
    isStudentStarted: {
      type: Boolean,
      default: false,
    },

    isSeniorStarted: {
      type: Boolean,
      default: false,
    },

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

    isEarningsReleased: {
      type: Boolean,
      default: false,
    },

    isReminderSent: {
      type: Boolean,
      default: false,
      index: true,
    },

    // 🗑️ SOFT DELETE — user can hide from their session history
    hiddenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Create indexes for faster queries
bookingSchema.index({ student: 1 });
bookingSchema.index({ senior: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startTime: 1 });

module.exports = mongoose.model("Booking", bookingSchema);