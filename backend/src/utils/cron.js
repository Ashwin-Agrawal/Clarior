const cron = require("node-cron");
const Slot = require("../models/Slots");

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
