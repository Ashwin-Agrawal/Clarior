const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response.util");

// 🎯 Get all seniors — Fix 5: only return safe public fields
exports.getAllSeniors = async (req, res) => {
  try {
    const { q, college, domain, course, branch } = req.query;

    const and = [{ role: "senior", isVerified: true }];

    const safeRegex = (value) => ({
      $regex: String(value).trim(),
      $options: "i",
    });

    if (q && String(q).trim()) {
      and.push({
        $or: [
          { name: safeRegex(q) },
          { college: safeRegex(q) },
          { bio: safeRegex(q) },
        ],
      });
    }

    if (college && String(college).trim()) {
      and.push({ college: safeRegex(college) });
    }

    const effectiveDomain = domain ?? course;
    if (effectiveDomain && String(effectiveDomain).trim()) {
      and.push({ domain: safeRegex(effectiveDomain) });
    }

    if (branch && String(branch).trim()) {
      and.push({ branch: safeRegex(branch) });
    }

    const filter = and.length === 1 ? and[0] : { $and: and };

    // Fix 5: Only expose safe public fields — no phone, upiId, balances, credits, payments
    const seniors = await User.find(filter).select(
      "name college branch domain bio rating numReviews isVerified year linkedin sessionsCompleted"
    );

    const Slot = require("../models/Slots");
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const seniorsWithSlots = await Promise.all(
      seniors.map(async (s) => {
        const count = await Slot.countDocuments({
          senior: s._id,
          isBooked: false,
          date: { $gte: now }
        });
        return {
          ...s.toObject(),
          activeSlotsCount: count
        };
      })
    );

    res.status(200).json({
      success: true,
      count: seniorsWithSlots.length,
      seniors: seniorsWithSlots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🧑‍🏫 APPLY FOR SENIOR ROLE
exports.applySenior = async (req, res) => {
  try {
    const { phone, college, domain, branch, year, cgpa, bio, linkedin } = req.body;

    if (!phone || !college || !branch) {
      return res.status(400).json({
        success: false,
        message: "Phone, college, and branch are required",
      });
    }

    const normalizedPhone = String(phone).replace(/\s+/g, "").trim();
    if (!/^\+?\d{10,15}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid phone number",
      });
    }

    if (linkedin && !/^https?:\/\//.test(linkedin)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid LinkedIn URL",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "senior" && user.isVerified) {
      return res.status(400).json({ success: false, message: "You are already a verified senior" });
    }

    if (user.applicationStatus === "pending") {
      return res.status(400).json({ success: false, message: "Your senior application is already under review" });
    }

    user.phone = normalizedPhone;
    user.college = String(college).trim();
    user.domain = domain ? String(domain).trim() : user.domain;
    user.branch = String(branch).trim();
    user.bio = bio ? String(bio).trim() : user.bio;
    user.linkedin = linkedin ? String(linkedin).trim() : user.linkedin;
    user.year = year !== undefined && year !== "" ? Number(year) : user.year;
    user.cgpa = cgpa !== undefined && cgpa !== "" ? Number(cgpa) : user.cgpa;
    user.isVerified = false;
    user.applicationStatus = "pending";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Application submitted successfully",
      user: await User.findById(req.user.id).select("-password"),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✏️ UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { college, domain, branch, bio, linkedin, isAnonymous } = req.body;

    // 🔒 Validate input lengths
    if (college && college.length > 100) {
      return res.status(400).json({ message: "College name too long" });
    }
    if (domain && domain.length > 50) {
      return res.status(400).json({ message: "Domain too long" });
    }
    if (branch && branch.length > 50) {
      return res.status(400).json({ message: "Branch too long" });
    }
    if (bio && bio.length > 500) {
      return res.status(400).json({ message: "Bio too long (max 500 chars)" });
    }
    if (linkedin && (!linkedin.startsWith("http") || !linkedin.includes("linkedin.com"))) {
      return res.status(400).json({ message: "Invalid LinkedIn URL" });
    }
    if (linkedin && linkedin.length > 255) {
      return res.status(400).json({ message: "LinkedIn URL too long" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (college) user.college = college.trim();
    if (domain) user.domain = domain.trim();
    if (branch) user.branch = branch.trim();
    if (bio) user.bio = bio.trim();
    if (linkedin) user.linkedin = linkedin.trim();
    if (typeof isAnonymous === "boolean") user.isAnonymous = isAnonymous;

    await user.save();

    res.json({
      message: "Profile updated",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 💰 ADD / UPDATE UPI (NEW)
exports.updateUpi = async (req, res) => {
  try {
    const { upiId } = req.body;

    if (!upiId || typeof upiId !== "string") {
      return res.status(400).json({
        message: "Valid UPI ID required",
      });
    }

    const trimmedUpi = upiId.trim();

    // 🔒 Validate UPI format: username@bankname or 10-digit number@bankname
    const upiRegex = /^[a-zA-Z0-9._-]{3,}@[a-zA-Z]{3,}$/;
    if (!upiRegex.test(trimmedUpi)) {
      return res.status(400).json({
        message: "Invalid UPI ID format (e.g., username@bank)",
      });
    }

    if (trimmedUpi.length > 255) {
      return res.status(400).json({
        message: "UPI ID too long",
      });
    }

    const user = await User.findById(req.user.id);

    if (user.role !== "senior") {
      return res.status(403).json({
        message: "Only seniors can add UPI",
      });
    }

    user.upiId = trimmedUpi;
    await user.save();

    res.json({
      message: "UPI updated successfully",
      upiId: user.upiId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👤 GET CURRENT USER (NEW)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    return sendSuccess(res, "User retrieved successfully", { user });
  } catch (error) {
    return sendError(res, error.message);
  }
};

// Fix 10: GET /users/seniors/:id — public endpoint to fetch a single verified senior
exports.getSeniorById = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid senior ID" });
    }
    const senior = await User.findOne({ _id: id, role: "senior", isVerified: true }).select(
      "name college branch domain bio rating numReviews isVerified year linkedin sessionsCompleted"
    );
    if (!senior) return res.status(404).json({ message: "Senior not found" });

    const Slot = require("../models/Slots");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const count = await Slot.countDocuments({
      senior: senior._id,
      isBooked: false,
      date: { $gte: now }
    });

    const seniorObj = {
      ...senior.toObject(),
      activeSlotsCount: count
    };

    return res.json({ senior: seniorObj });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Fix 12: PATCH /users/verification-details — atomic college + upiId update for seniors
exports.updateVerificationDetails = async (req, res) => {
  try {
    const { college, upiId } = req.body;
    if (!college || !upiId) {
      return res.status(400).json({ message: "College and UPI ID are required" });
    }
    const upiRegex = /^[\w.]+@[\w]+$/;
    if (!upiRegex.test(upiId)) {
      return res.status(400).json({ message: "Invalid UPI ID format" });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { college, upiId } },
      { new: true }
    ).select("-password");
    return res.json({ message: "Verification details updated", user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
