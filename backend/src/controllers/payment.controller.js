const crypto = require("crypto");
const Razorpay = require("razorpay");
const User = require("../models/User");

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY;
  const keySecret = process.env.RAZORPAY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

function getMissingPaymentEnv() {
  const missing = [];
  if (!process.env.RAZORPAY_KEY) missing.push("RAZORPAY_KEY");
  if (!process.env.RAZORPAY_SECRET) missing.push("RAZORPAY_SECRET");
  return missing;
}

// 🧾 CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(503).json({
        message: `Payments are not configured on the server. Missing: ${getMissingPaymentEnv().join(", ")}`,
      });
    }

    const { plan } = req.body;

    // ✅ VALIDATION
    if (!["single", "bundle"].includes(plan)) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    let amount = 0;

    if (plan === "single") amount = 69 * 100;
    if (plan === "bundle") amount = 189 * 100;

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${req.user.id}_${Date.now()}`,
      notes: {
        userId: req.user.id,
        plan: plan, // ✅ secure storage
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ VERIFY PAYMENT (FINAL SECURE VERSION)
exports.verifyPayment = async (req, res) => {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(503).json({
        message: `Payments are not configured on the server. Missing: ${getMissingPaymentEnv().join(", ")}`,
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // ✅ VERIFY SIGNATURE
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // ✅ FETCH ORDER FROM RAZORPAY
    const order = await razorpay.orders.fetch(razorpay_order_id);

    const plan = order.notes.plan;
    const userId = order.notes.userId;

    // ✅ SECURITY CHECK
    if (userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized payment" });
    }

    let credits = 0;

    if (plan === "single") credits = 1;
    else if (plan === "bundle") credits = 3;
    else {
      return res.status(400).json({ message: "Invalid plan in order" });
    }

    // ✅ FETCH USER
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ❌ DUPLICATE PAYMENT CHECK
    if (user.payments.some(p => p.paymentId === razorpay_payment_id)) {
      return res.status(400).json({
        message: "Payment already processed",
      });
    }

    // ✅ SAVE PAYMENT
    user.payments.push({
      paymentId: razorpay_payment_id,
    });

    // ✅ ADD CREDITS
    user.callCredits += credits;

    await user.save();

    res.json({
      message: "Payment successful",
      creditsAdded: credits,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};