const Withdraw = require("../models/Withdraw");
const User = require("../models/User");
const mongoose = require("mongoose");

// 🎓 REQUEST
exports.requestWithdraw = async (req, res) => {
  try {
    const { amount } = req.body;
    
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

    const user = await User.findById(req.user.id).session(session);

    if (!user.upiId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Add UPI first",
      });
    }

    if (user.availableBalance < amountNum) {
      await session.abortTransaction();
      session.endSession();
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
          upiId: user.upiId,
          status: "pending",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Withdraw request sent",
      withdraw: withdraw[0],
    });
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

    res.json({
      message: "Rejected",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};