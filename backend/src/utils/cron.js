const cron = require("node-cron");
const Booking = require("../models/Booking");
const User = require("../models/User");

cron.schedule("*/5 * * * *", async () => {
  console.log("⏳ Running auto-release job...");

  try {
    const bookings = await Booking.find({
      isSeniorMarkedDone: true,
      isStudentConfirmed: false,
      status: "confirmed",
    });

    for (let booking of bookings) {
      const now = new Date();

      // ⏱️ 24 HOURS CHECK
      const diff = (now - booking.updatedAt) / (1000 * 60 * 60);

      if (diff >= 24) {
        const payout = 69 * 0.8;

        // 💰 MOVE MONEY
        await User.findByIdAndUpdate(booking.senior, {
          $inc: {
            pendingEarnings: -payout,
            availableBalance: payout,
          },
        });

        booking.status = "completed";
        booking.isStudentConfirmed = true;

        await booking.save();

        console.log(`✅ Auto released for booking ${booking._id}`);
      }
    }
  } catch (err) {
    console.error("Auto release error:", err.message);
  }
});