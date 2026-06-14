const mongoose = require("mongoose");

/**
 * 🔥 BOOKING SERVICE - Business logic layer
 * Handles all booking-related operations with atomic transactions
 */

class BookingService {
  /**
   * Create a new booking with atomic operations
   */
  static async createBooking(studentId, slotId) {
    const User = require("../models/User");
    const Slot = require("../models/Slots");
    const Booking = require("../models/Booking");
    
    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Get user
      const user = await User.findById(studentId).session(session);
      if (!user) throw new Error("USER_NOT_FOUND");
      if (user.role !== "student") throw new Error("ONLY_STUDENTS_CAN_BOOK");
      if (user.callCredits <= 0) throw new Error("INSUFFICIENT_CREDITS");

      // 2. Atomically lock the slot (prevents race conditions)
      const slot = await Slot.findOneAndUpdate(
        { _id: slotId, isBooked: false },
        { $set: { isBooked: true } },
        { new: true, session }
      );
      if (!slot) throw new Error("SLOT_ALREADY_BOOKED");

      // 3. Verify senior exists and is verified
      const senior = await User.findById(slot.senior).session(session);
      if (!senior || senior.role !== "senior") throw new Error("SENIOR_NOT_FOUND");
      if (!senior.isVerified) throw new Error("SENIOR_NOT_VERIFIED");

      // 4. Deduct credits
      user.callCredits -= 1;
      await user.save({ session });

      // 5. Create booking
      let start;
      if (slot.dateTime) {
        start = new Date(slot.dateTime);
      } else {
        start = new Date(slot.date);
        const timePart = slot.time.split("-")[0];
        const [h, m] = timePart.split(":").map(Number);
        start.setUTCHours(h, m, 0, 0);
        start.setTime(start.getTime() - 5.5 * 60 * 60 * 1000);
      }
      const end = new Date(start.getTime() + 25 * 60 * 1000);

      const booking = await Booking.create(
        [
          {
            student: studentId,
            senior: slot.senior,
            slot: slotId,
            date: slot.date,
            timeSlot: slot.time,
            status: "confirmed",
            startTime: start,
            endTime: end,
            meetLink: null,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      const bookingObj = booking[0].toObject();

      // Create Meet link immediately (platform account), if connected.
      // This runs AFTER the DB transaction to avoid holding DB locks while calling Google APIs.
      try {
        const { createMeetForBooking } = require("../controllers/google.controller");
        const { meetLink } = await createMeetForBooking(bookingObj, {
          summary: "Clarior Mentorship Session",
          description: `Booking ${bookingObj._id}`,
        });
        await Booking.updateOne({ _id: bookingObj._id }, { $set: { meetLink } });
        bookingObj.meetLink = meetLink;
      } catch (e) {
        // If Google isn't connected/configured, booking still succeeds; meetLink stays null.
      }

      return bookingObj;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get user bookings with proper filtering
   */
  static async getUserBookings(userId, role) {
    const Booking = require("../models/Booking");

    let query = {};
    if (role === "student") {
      query.student = userId;
    } else if (role === "senior") {
      query.senior = userId;
    }

    return await Booking.find(query)
      .populate("student", "name email")
      .populate("senior", "name email college")
      .sort({ startTime: -1, createdAt: -1 })
      .lean();
  }

  /**
   * Cancel booking with refund
   */
  static async cancelBooking(bookingId, userId) {
    const Booking = require("../models/Booking");
    const User = require("../models/User");
    const Slot = require("../models/Slots");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const booking = await Booking.findById(bookingId).session(session);
      if (!booking) throw new Error("BOOKING_NOT_FOUND");
      if (booking.student.toString() !== userId) throw new Error("NOT_AUTHORIZED");
      if (booking.status === "cancelled") throw new Error("ALREADY_CANCELLED");

      // Update booking status
      booking.status = "cancelled";
      await booking.save({ session });

      // Refund credits
      await User.updateOne(
        { _id: userId },
        { $inc: { callCredits: 1 } }
      ).session(session);

      // Release slot
      if (booking.slot) {
        await Slot.updateOne(
          { _id: booking.slot },
          { isBooked: false }
        ).session(session);
      }

      await session.commitTransaction();
      return booking;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

module.exports = BookingService;
