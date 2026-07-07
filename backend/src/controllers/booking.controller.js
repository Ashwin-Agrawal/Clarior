const Booking = require("../models/Booking");
const Slot = require("../models/Slots");
const User = require("../models/User");
const { sendSuccess, sendError, sendBadRequest, sendForbidden } = require("../utils/response.util");
const BookingService = require("../services/booking.service");

// 🔥 ERROR MESSAGES
const ERROR_MESSAGES = {
  USER_NOT_FOUND: "User not found",
  ONLY_STUDENTS_CAN_BOOK: "Only students can book sessions",
  INSUFFICIENT_CREDITS: "Insufficient credits. Please buy a plan.",
  SLOT_NOT_FOUND: "Slot not found",
  SENIOR_NOT_FOUND: "Senior not found",
  SENIOR_NOT_VERIFIED: "This senior is not verified yet. Please choose another senior.",
  SLOT_ALREADY_BOOKED: "This slot is already booked",
  BOOKING_NOT_FOUND: "Booking not found",
  NOT_AUTHORIZED: "You are not authorized to cancel this booking",
  ALREADY_CANCELLED: "This booking is already cancelled",
};

// 🎓 CREATE BOOKING
exports.createBooking = async (req, res) => {
  try {
    const { slotId } = req.body;

    const booking = await BookingService.createBooking(req.user.id, slotId);

    return sendSuccess(res, "Booking confirmed successfully", { booking }, 201);
  } catch (error) {
    const errorMessage = ERROR_MESSAGES[error.message] || error.message;
    
    if (error.message === "NOT_AUTHORIZED") {
      return sendForbidden(res, errorMessage);
    }
    
    return sendBadRequest(res, errorMessage);
  }
};

// 🔗 SENIOR SET MEET LINK
exports.setMeetLink = async (req, res) => {
  try {
    const { meetLink } = req.body;
    const { bookingId } = req.params;

    if (!meetLink || typeof meetLink !== "string") {
      return res.status(400).json({ message: "meetLink is required" });
    }

    const trimmed = meetLink.trim();
    const isHttp = /^https?:\/\//i.test(trimmed);
    const looksLikeMeet = /meet\.google\.com/i.test(trimmed);
    if (!isHttp || !looksLikeMeet) {
      return res.status(400).json({
        message: "Valid Google Meet link required",
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Not found" });

    if (booking.senior.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is cancelled" });
    }

    booking.meetLink = trimmed;
    await booking.save();

    return res.json({
      message: "Meet link updated",
      meetLink: booking.meetLink,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// 👨‍🏫 SENIOR MARK COMPLETE — atomic update for isSeniorMarkedDone + pendingEarnings
exports.markCompletedBySenior = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) return res.status(404).json({ message: "Not found" });

    if (booking.senior.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!booking.isCallStarted) {
      return res.status(400).json({ message: "Call not started" });
    }

    if (booking.isSeniorMarkedDone) {
      return res.status(400).json({ message: "Already marked" });
    }

    const diff = (new Date() - booking.actualStartTime) / 1000;

    if (diff < 1200) {
      return res.status(400).json({
        message: "20 minutes not completed",
      });
    }

    const payout = parseInt(process.env.PAYOUT_AMOUNT) || 52; // ✅ CONFIGURABLE

    // Fix 4: Atomic update — sets isSeniorMarkedDone and increments pendingEarnings in one operation
    await Booking.findByIdAndUpdate(req.params.bookingId, {
      $set: { isSeniorMarkedDone: true },
    });

    await User.findByIdAndUpdate(booking.senior, {
      $inc: { pendingEarnings: payout },
    });

    // Trigger notification in background
    (async () => {
      try {
        const Notification = require("../models/Notification");
        const seniorUser = await User.findById(booking.senior);
        
        await Notification.create({
          recipient: booking.student,
          title: "Session Marked Completed",
          message: `${seniorUser.name} has marked your session as completed. Please confirm and leave a review.`,
          type: "booking"
        });
      } catch (err) {
        console.error("Error sending completed notification:", err.message);
      }
    })();

    res.json({
      message: "Marked complete. Waiting for student confirmation.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🎓 STUDENT CONFIRM
exports.confirmByStudent = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) return res.status(404).json({ message: "Not found" });

    if (booking.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!booking.isSeniorMarkedDone) {
      return res.status(400).json({
        message: "Senior not completed",
      });
    }

    if (booking.isStudentConfirmed) {
      return res.status(400).json({
        message: "Already confirmed",
      });
    }

    booking.isStudentConfirmed = true;
    booking.status = "completed";
    await booking.save();

    res.json({
      message: "Confirmed. Pending admin release.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ CANCEL BOOKING (WITH REFUND & SLOT RELEASE)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await BookingService.cancelBooking(req.params.bookingId, req.user.id);
    res.json({ message: "Booking cancelled & credit refunded", booking });
  } catch (error) {
    const errorMessage = ERROR_MESSAGES[error.message] || error.message;
    if (error.message === "NOT_AUTHORIZED") {
      return sendForbidden(res, errorMessage);
    }
    return sendBadRequest(res, errorMessage);
  }
};

// Fix 4: getMyBookings — admins get empty array instead of undefined
exports.getMyBookings = async (req, res) => {
  try {
    let bookings;
    const userId = req.user.id;

    if (req.user.role === "student") {
      bookings = await Booking.find({ student: userId, hiddenBy: { $ne: userId } })
        .populate("senior", "name college")
        .sort({ startTime: 1, createdAt: -1 });
    } else if (req.user.role === "senior") {
      bookings = await Booking.find({ senior: userId, hiddenBy: { $ne: userId } })
        .populate("student", "name")
        .sort({ startTime: 1, createdAt: -1 });
    } else {
      bookings = [];
    }

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Fix 4: startCall — time check so call can only start 5 minutes before scheduled time
exports.startCall = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) return res.status(404).json({ message: "Not found" });

    const isStudent = booking.student.toString() === req.user.id;
    const isSenior = booking.senior.toString() === req.user.id;

    if (!isStudent && !isSenior) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.isCallStarted) {
      return res.status(400).json({ message: "Already started" });
    }

    // Prevent joining too early
    const now = new Date();
    const sessionStart = new Date(booking.startTime);
    const fiveMinBefore = new Date(sessionStart.getTime() - 5 * 60 * 1000);
    if (now < fiveMinBefore) {
      return res.status(400).json({
        message: "Session has not started yet. You can join 5 minutes before the scheduled time.",
      });
    }

    if (isStudent) {
      booking.isStudentStarted = true;
    }
    if (isSenior) {
      booking.isSeniorStarted = true;
    }

    if (booking.isStudentStarted && booking.isSeniorStarted) {
      booking.isCallStarted = true;
      booking.actualStartTime = new Date();
    }

    await booking.save();

    res.json({
      message: booking.isCallStarted ? "Call started for both" : "Start confirmed. Waiting for the other participant.",
      isStudentStarted: booking.isStudentStarted,
      isSeniorStarted: booking.isSeniorStarted,
      isCallStarted: booking.isCallStarted,
      startTime: booking.actualStartTime,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Fix 11: GET /bookings/:id — view a single booking (student, senior, or admin only)
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }
    const booking = await Booking.findById(id)
      .populate("student", "name email")
      .populate("senior", "name email college")
      .populate("slot")
      .lean();
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    
    // Only allow the student, senior, or admin to view
    const userId = req.user.id;
    const role = req.user.role;
    if (
      role !== "admin" &&
      booking.student._id.toString() !== userId &&
      booking.senior._id.toString() !== userId
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Attach existing review if present
    const Review = require("../models/Review");
    const bookingObjectId = new mongoose.Types.ObjectId(id);
    let review = await Review.findOne({ booking: bookingObjectId }).lean();
    
    if (!review && booking.student && booking.senior) {
      // Fallback for older reviews created without booking ID
      review = await Review.findOne({
        student: new mongoose.Types.ObjectId(booking.student._id),
        senior: new mongoose.Types.ObjectId(booking.senior._id),
      }).lean();
    }
    
    booking.review = review;

    return res.json({ booking });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// 🗑️ HIDE BOOKING FROM HISTORY (soft delete — only completed or cancelled)
exports.hideBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const userId = req.user.id;
    const isStudent = booking.student.toString() === userId;
    const isSenior = booking.senior.toString() === userId;

    if (!isStudent && !isSenior) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Only allow hiding completed or cancelled sessions
    if (booking.status !== "completed" && booking.status !== "cancelled") {
      return res.status(400).json({
        message: "Only completed or cancelled sessions can be removed from history.",
      });
    }

    // Idempotent: only add if not already hidden by this user
    await Booking.findByIdAndUpdate(req.params.bookingId, {
      $addToSet: { hiddenBy: userId },
    });

    return res.json({ message: "Session removed from your history." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// 📝 UPDATE PREP NOTES
exports.updateBookingNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const userId = req.user.id;
    if (booking.student.toString() !== userId && booking.senior.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.notes = notes || "";
    await booking.save();

    return res.json({ message: "Notes updated successfully", booking });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
