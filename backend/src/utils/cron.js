const cron = require("node-cron");
const Slot = require("../models/Slots");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Notification = require("../models/Notification");
const EmailService = require("../services/email.service");

// Run every minute to check for sessions starting in 5 minutes
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const fireTimeMin = new Date(now.getTime() + 4 * 60 * 1000);
    const fireTimeMax = new Date(now.getTime() + 6 * 60 * 1000);

    // Find active confirmed bookings starting in ~5 mins that haven't been reminded
    const bookings = await Booking.find({
      status: "confirmed",
      isReminderSent: { $ne: true },
      startTime: { $gte: fireTimeMin, $lte: fireTimeMax }
    });

    for (const booking of bookings) {
      // 1. Mark as sent immediately to prevent double reminders
      booking.isReminderSent = true;
      await booking.save();

      // 2. Load participants
      const student = await User.findById(booking.student);
      const senior = await User.findById(booking.senior);

      if (student && senior) {
        const timeStr = new Date(booking.startTime).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" });

        // 3. Send in-app notifications
        await Notification.create({
          recipient: student._id,
          title: "Session Starting Soon!",
          message: `Your guidance call with senior ${senior.name} starts in 5 minutes (${timeStr}). Join now!`,
          type: "system"
        });

        await Notification.create({
          recipient: senior._id,
          title: "Session Starting Soon!",
          message: `Your guidance call with student ${student.name} starts in 5 minutes (${timeStr}). Join now!`,
          type: "system"
        });

        // 4. Send transactional emails
        await EmailService.sendReminderEmail(booking, student, senior);
      }
    }
  } catch (err) {
    console.error("[CRON] Error sending session reminders:", err.message);
  }
});

// Fix 13: Run daily at midnight — delete past unbooked slots to keep DB clean
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();
    const result = await Slot.deleteMany({ dateTime: { $lt: now }, isBooked: false });
    console.log(`[CRON] Cleaned up ${result.deletedCount} expired slots`);
  } catch (err) {
    console.error("[CRON] Error cleaning slots:", err.message);
  }
});

console.log("[CRON] Scheduled jobs initialized");
