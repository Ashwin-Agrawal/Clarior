const User = require("../models/User");


// 📊 GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// 🔎 GET ONLY UNVERIFIED SENIORS
exports.getPendingSeniors = async (req, res) => {
  try {
    const seniors = await User.find({
      role: "senior",
      isVerified: false,
    }).select("-password");

    res.json({
      success: true,
      count: seniors.length,
      seniors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ✅ VERIFY SENIOR
exports.verifySenior = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "senior") {
      return res.status(400).json({
        success: false,
        message: "User is not a senior",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Senior already verified",
      });
    }

    user.isVerified = true;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      message: "Senior verified successfully",
      user: userObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ❌ REJECT / DELETE USER — with cascade cleanup
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const Slot = require("../models/Slots");
    const Booking = require("../models/Booking");
    const Review = require("../models/Review");

    // Cascade cleanup before deleting the user
    await Slot.deleteMany({ senior: userId });
    await Booking.updateMany({ senior: userId }, { $set: { status: "cancelled" } });
    await Review.deleteMany({ senior: userId });

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🧪 ADMIN: GRANT CALL CREDITS (testing/manual adjustments)
exports.grantCredits = async (req, res) => {
  try {
    const { userId } = req.params;
    const { credits } = req.body;

    // 🔒 Validate inputs
    if (!credits) {
      return res.status(400).json({ message: "Credits amount required" });
    }

    const creditsNum = Number(credits);
    if (!Number.isFinite(creditsNum) || creditsNum <= 0 || creditsNum > 1000) {
      return res.status(400).json({ message: "Credits must be between 1 and 1000" });
    }

    // 🔒 Ensure it's an integer
    if (!Number.isInteger(creditsNum)) {
      return res.status(400).json({ message: "Credits must be a whole number" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.callCredits = (user.callCredits || 0) + creditsNum;
    await user.save();

    return res.json({
      success: true,
      message: "Credits granted",
      userId: user._id,
      callCredits: user.callCredits,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 🧪 ADMIN: FAST-FORWARD BOOKING (testing only - disabled in production)
exports.fastForwardBooking = async (req, res) => {
  try {
    // 🔒 Only available in development
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        message: "This endpoint is not available in production",
      });
    }

    const Booking = require("../models/Booking");
    const { bookingId } = req.params;
    const { minutes = 26 } = req.body || {};

    const minutesNum = Number(minutes);
    if (!Number.isFinite(minutesNum) || minutesNum <= 0) {
      return res.status(400).json({ message: "Valid minutes required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Not found" });

    booking.isCallStarted = true;
    booking.actualStartTime = new Date(Date.now() - minutesNum * 60 * 1000);
    await booking.save();

    return res.json({
      success: true,
      message: "Booking fast-forwarded",
      bookingId: booking._id,
      actualStartTime: booking.actualStartTime,
      isCallStarted: booking.isCallStarted,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 💰 ADMIN: GET PENDING EARNINGS RELEASES
exports.getPendingReleases = async (req, res) => {
  try {
    const Booking = require("../models/Booking");
    // Fix 7b: simplified query — any booking where senior marked done but earnings not yet released
    const bookings = await Booking.find({
      isSeniorMarkedDone: true,
      isEarningsReleased: { $ne: true },
    })
      .populate("senior", "name email upiId")
      .populate("student", "name email")
      .sort({ updatedAt: 1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 💰 ADMIN: RELEASE EARNINGS FOR A BOOKING
exports.releaseEarnings = async (req, res) => {
  try {
    const Booking = require("../models/Booking");
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate("senior");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (!booking.isSeniorMarkedDone || booking.isEarningsReleased) {
      return res.status(400).json({ message: "Booking is not eligible for release" });
    }

    const payout = parseInt(process.env.PAYOUT_AMOUNT) || 52;

    // Fix 7a: Atomic update — prevents race conditions on balance fields
    const updated = await User.findOneAndUpdate(
      { _id: booking.senior._id, pendingEarnings: { $gte: payout } },
      { $inc: { pendingEarnings: -payout, availableBalance: payout } },
      { new: true }
    );
    if (!updated) return res.status(400).json({ message: "Insufficient pending earnings" });

    booking.isEarningsReleased = true;
    if (booking.status !== "completed") {
      booking.status = "completed";
    }
    await booking.save();

    res.json({
      success: true,
      message: "Earnings released successfully",
      bookingId: booking._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
