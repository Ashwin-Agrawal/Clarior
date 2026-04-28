const Booking = require("../models/Booking");
const User = require("../models/User");

const autoReleasePayments = async () => {
  try {
    console.log("⏳ Running auto-release job...");

    const bookings = await Booking.find({
      isSeniorMarkedDone: true,
      isStudentConfirmed: false,
      status: "confirmed",
    });

    for (let booking of bookings) {
      const now = new Date();
      const diffMinutes = (now - booking.updatedAt) / (1000 * 60);

      if (diffMinutes > 30) {
        const payout = parseInt(process.env.PAYOUT_AMOUNT) || 52;

        const senior = await User.findById(booking.senior);
        if (!senior) continue;

        if (senior.pendingEarnings >= payout) {
          senior.pendingEarnings -= payout;
          senior.availableBalance += payout;

          await senior.save();

          booking.isStudentConfirmed = true;
          booking.status = "completed";

          await booking.save();

          console.log(`✅ Auto released for booking ${booking._id}`);
        }
      }
    }
  } catch (err) {
    console.error("❌ Auto-release error:", err.message);
  }
};

module.exports = autoReleasePayments;