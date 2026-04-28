const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response.util");

// 🎯 Get all seniors
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

    const seniors = await User.find(filter).select("-password");

    res.status(200).json({
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