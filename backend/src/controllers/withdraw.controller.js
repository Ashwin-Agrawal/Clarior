const Withdraw = require("../models/Withdraw");
const User = require("../models/User");
const mongoose = require("mongoose");

// 🎓 REQUEST
exports.requestWithdraw = async (req, res) => {
  try {
    const { amount, upiId } = req.body;
    
    // 🔒 Validate input
    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const amountNum = Number(amount);

    if (!Number.isFinite(amountNum) || amountNum <= 0 || amountNum > 100000) {
      return res.status(400).json({ message: "Amount must be between 1 and 100000" });
    }

    // 🔒 Prevent decimal amounts for payments
    if (!Number.isInteger(amountNum)) {
      return res.status(400).json({ message: "Amount must be a whole number" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(req.user.id).session(session);

      const finalUpiId = upiId ? String(upiId).trim() : user.upiId;

      if (!finalUpiId) {
        await session.abortTransaction();
        return res.status(400).json({
          message: "UPI ID is required",
        });
      }

      // Validate UPI ID format
      const upiRegex = /^[\w.]+@[\w]+$/;
      if (!upiRegex.test(finalUpiId)) {
        await session.abortTransaction();
        return res.status(400).json({
          message: "Invalid UPI ID format (e.g. name@bank)",
        });
      }

      if (user.availableBalance < amountNum) {
        await session.abortTransaction();
        return res.status(400).json({
          message: "Insufficient balance",
        });
      }

      // Reserve funds immediately to prevent multiple pending requests overspending.
      user.availableBalance -= amountNum;
      await user.save({ session });

      const withdraw = await Withdraw.create(
        [
          {
            senior: user._id,
            amount: amountNum,
            upiId: finalUpiId,
            status: "pending",
          },
        ],
        { session }
      );

      await session.commitTransaction();

      res.json({
        message: "Withdraw request sent",
        withdraw: withdraw[0],
      });
    } catch (err) {
      await session.abortTransaction();
      res.status(500).json({ message: err.message });
    } finally {
      session.endSession();
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👑 APPROVE
exports.approveWithdraw = async (req, res) => {
  try {
    const withdraw = await Withdraw.findById(req.params.id);

    if (!withdraw) {
      return res.status(404).json({ message: "Not found" });
    }

    if (withdraw.status !== "pending") {
      return res.status(400).json({
        message: "Already processed",
      });
    }

    withdraw.status = "approved";
    await withdraw.save();

    // Trigger in-app notification in background
    (async () => {
      try {
        const Notification = require("../models/Notification");
        await Notification.create({
          recipient: withdraw.senior,
          title: "Withdrawal Approved",
          message: `Your withdrawal request of ₹${withdraw.amount} has been approved and processed to UPI ID: ${withdraw.upiId || "your default UPI ID"}.`,
          type: "earnings"
        });
      } catch (err) {
        console.error("Error sending withdraw approval notification:", err.message);
      }
    })();

    res.json({
      message: "Approved & paid",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👑 REJECT
exports.rejectWithdraw = async (req, res) => {
  try {
    const withdraw = await Withdraw.findById(req.params.id);

    if (!withdraw) {
      return res.status(404).json({ message: "Not found" });
    }

    if (withdraw.status !== "pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    withdraw.status = "rejected";
    await withdraw.save();

    // Refund reserved funds
    await User.findByIdAndUpdate(withdraw.senior, {
      $inc: { availableBalance: withdraw.amount },
    });

    // Trigger in-app notification in background
    (async () => {
      try {
        const Notification = require("../models/Notification");
        await Notification.create({
          recipient: withdraw.senior,
          title: "Withdrawal Request Rejected",
          message: `Your withdrawal request of ₹${withdraw.amount} was rejected. The reserved funds have been refunded back to your available balance.`,
          type: "system"
        });
      } catch (err) {
        console.error("Error sending withdraw reject notification:", err.message);
      }
    })();

    res.json({
      message: "Rejected",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👑 GET PENDING WITHDRAWS (ADMIN)
exports.getPendingWithdraws = async (req, res) => {
  try {
    const withdraws = await Withdraw.find({ status: "pending" })
      .populate("senior", "name email phone upiId college branch year cgpa")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: withdraws.length,
      withdraws,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
