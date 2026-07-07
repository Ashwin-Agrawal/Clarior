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

      if (slot.senior.toString() === studentId.toString()) throw new Error("CANNOT_BOOK_OWN_SLOT");

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
      const end = new Date(start.getTime() + 20 * 60 * 1000);

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

      // Trigger notifications in the background
      (async () => {
        try {
          const Notification = require("../models/Notification");
          const EmailService = require("./email.service");
          const studentUser = await User.findById(studentId);
          const seniorUser = await User.findById(slot.senior);

          // 1. Create In-app notifications
          await Notification.create({
            recipient: studentId,
            title: "Booking Confirmed",
            message: `Session confirmed! You booked a session with ${seniorUser.name} on ${new Date(slot.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} at ${slot.time}.`,
            type: "booking"
          });

          await Notification.create({
            recipient: slot.senior,
            title: "New Booking Alert",
            message: `New booking! ${studentUser.name} has booked your slot on ${new Date(slot.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} at ${slot.time}.`,
            type: "booking"
          });

          // 2. Send emails
          await EmailService.sendBookingEmail(bookingObj, studentUser, seniorUser, slot);
        } catch (err) {
          console.error("Error sending booking notifications:", err.message);
        }
      })();

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

      // Trigger notifications in the background
      (async () => {
        try {
          const Notification = require("../models/Notification");
          const EmailService = require("./email.service");
          
          const studentUser = await User.findById(booking.student);
          const seniorUser = await User.findById(booking.senior);
          const slotDetails = await Slot.findById(booking.slot);

          // 1. Create In-app notifications
          await Notification.create({
            recipient: booking.student,
            title: "Session Cancelled",
            message: `Session cancelled. Your session with ${seniorUser.name} was cancelled and 1 credit has been refunded to your wallet.`,
            type: "cancellation"
          });

          await Notification.create({
            recipient: booking.senior,
            title: "Session Cancelled",
            message: `Session cancelled. The booking with student ${studentUser.name} on ${new Date(booking.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} was cancelled.`,
            type: "cancellation"
          });

          // 2. Send emails
          if (slotDetails) {
            await EmailService.sendCancellationEmail(booking, studentUser, seniorUser, slotDetails);
          }
        } catch (err) {
          console.error("Error sending cancellation notifications:", err.message);
        }
      })();

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
