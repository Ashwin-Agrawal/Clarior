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

// 👨‍🏫 SENIOR MARK COMPLETE
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

    if (diff < 1500) {
      return res.status(400).json({
        message: "25 minutes not completed",
      });
    }

    booking.isSeniorMarkedDone = true;
    await booking.save();

    const payout = parseInt(process.env.PAYOUT_AMOUNT) || 52; // ✅ CONFIGURABLE

    await User.findByIdAndUpdate(booking.senior, {
      $inc: { pendingEarnings: payout },
    });

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

    const senior = await User.findById(booking.senior);

    if (!senior.upiId) {
      return res.status(400).json({
        message: "Senior has not added UPI",
      });
    }

    const payout = parseInt(process.env.PAYOUT_AMOUNT) || 52;

    // ✅ SAFE WALLET UPDATE
    if (senior.pendingEarnings < payout) {
      return res.status(400).json({
        message: "Invalid payout state",
      });
    }

    senior.pendingEarnings -= payout;
    senior.availableBalance += payout;

    await senior.save();

    booking.isStudentConfirmed = true;
    booking.status = "completed";
    await booking.save();

    res.json({
      message: "Confirmed. Money released.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ CANCEL BOOKING (WITH REFUND)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Not found" });
    }

    if (booking.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    // ✅ refund credit
    const user = await User.findById(req.user.id);
    user.callCredits += 1;
    await user.save();

    res.json({ message: "Booking cancelled & credit refunded" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    let bookings;

    if (req.user.role === "student") {
      bookings = await Booking.find({ student: req.user.id })
        .populate("senior", "name college")
        .sort({ startTime: 1, createdAt: -1 });
    } else if (req.user.role === "senior") {
      bookings = await Booking.find({ senior: req.user.id })
        .populate("student", "name")
        .sort({ startTime: 1, createdAt: -1 });
    }

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.startCall = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) return res.status(404).json({ message: "Not found" });

    if (booking.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.isCallStarted) {
      return res.status(400).json({ message: "Already started" });
    }

    booking.isCallStarted = true;
    booking.actualStartTime = new Date();

    await booking.save();

    res.json({
      message: "Call started",
      startTime: booking.actualStartTime,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};