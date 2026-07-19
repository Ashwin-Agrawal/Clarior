const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response.util");

// 🎯 Get all seniors — Fix 5: only return safe public fields
exports.getAllSeniors = async (req, res, next) => {
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
      "name college affiliatedCollege branch domain bio rating numReviews isVerified year linkedin sessionsCompleted"
    );

    const Slot = require("../models/Slots");
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const seniorIds = seniors.map(s => s._id);
    const slotCounts = await Slot.aggregate([
      {
        $match: {
          senior: { $in: seniorIds },
          isBooked: false,
          date: { $gte: now }
        }
      },
      {
        $group: {
          _id: "$senior",
          count: { $sum: 1 }
        }
      }
    ]);

    const countMap = slotCounts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    const seniorsWithSlots = seniors.map(s => ({
      ...s.toObject(),
      activeSlotsCount: countMap[s._id.toString()] || 0
    }));

    res.status(200).json({
      success: true,
      count: seniorsWithSlots.length,
      seniors: seniorsWithSlots,
    });
  } catch (error) {
    next(error);
  }
};

// 🧑‍🏫 APPLY FOR SENIOR ROLE
exports.applySenior = async (req, res) => {
  try {
    const { phone, college, domain, branch, year, cgpa, bio, linkedin, upiId, affiliatedCollege } = req.body;

    if (!phone || !college || !branch || !upiId) {
      return res.status(400).json({
        success: false,
        message: "Phone, college, branch, and UPI ID are required",
      });
    }

    const College = require("../models/College");
    const dbCollege = await College.findOne({ name: { $regex: new RegExp("^" + String(college).trim() + "$", "i") } });
    const isNewGen = dbCollege && (dbCollege.type === "New Gen" || dbCollege.type === "New-Gen");
    if (isNewGen) {
      if (!affiliatedCollege || !String(affiliatedCollege).trim()) {
        return res.status(400).json({
          success: false,
          message: "Affiliated College is required for New Gen colleges",
        });
      }
    }

    const normalizedPhone = String(phone).replace(/\s+/g, "").trim();
    if (!/^\+?\d{10,15}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid phone number",
      });
    }

    const trimmedUpi = String(upiId).trim();
    const upiRegex = /^[\w.]+@[\w]+$/;
    if (!upiRegex.test(trimmedUpi)) {
      return res.status(400).json({
        success: false,
        message: "Invalid UPI ID format (e.g. username@bank)",
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
    user.affiliatedCollege = isNewGen ? String(affiliatedCollege).trim() : null;
    user.domain = domain ? String(domain).trim() : user.domain;
    user.branch = String(branch).trim();
    user.bio = bio ? String(bio).trim() : user.bio;
    user.linkedin = linkedin ? String(linkedin).trim() : user.linkedin;
    user.upiId = trimmedUpi;
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
    const { college, domain, branch, bio, isAnonymous, year, avatar, cgpa } = req.body;

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
    if (year !== undefined && year !== null && year !== "") {
      const yearNum = Number(year);
      if (isNaN(yearNum) || yearNum < 1 || yearNum > 6) {
        return res.status(400).json({ message: "Invalid year. Must be between 1 and 6." });
      }
    }
    if (cgpa !== undefined && cgpa !== null && cgpa !== "") {
      const cgpaNum = Number(cgpa);
      if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
        return res.status(400).json({ message: "Invalid CGPA. Must be between 0 and 10." });
      }
    }
    if (avatar && !["initials", "avatar-1", "avatar-2", "avatar-3", "avatar-4", "avatar-5", "avatar-6"].includes(avatar)) {
      return res.status(400).json({ message: "Invalid avatar selection" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (college) user.college = college.trim();
    if (domain) user.domain = domain.trim();
    if (branch) user.branch = branch.trim();
    if (bio) user.bio = bio.trim();
    if (year !== undefined && year !== null && year !== "") user.year = Number(year);
    if (cgpa !== undefined && cgpa !== null && cgpa !== "") user.cgpa = Number(cgpa);
    if (avatar) user.avatar = avatar;
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
      "name college affiliatedCollege branch domain bio rating numReviews isVerified year linkedin sessionsCompleted"
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
    const { college, upiId, affiliatedCollege } = req.body;
    if (!college || !upiId) {
      return res.status(400).json({ message: "College and UPI ID are required" });
    }
    const upiRegex = /^[\w.]+@[\w]+$/;
    if (!upiRegex.test(upiId)) {
      return res.status(400).json({ message: "Invalid UPI ID format" });
    }
    const College = require("../models/College");
    const dbCollege = await College.findOne({ name: { $regex: new RegExp("^" + String(college).trim() + "$", "i") } });
    const isNewGen = dbCollege && (dbCollege.type === "New Gen" || dbCollege.type === "New-Gen");
    if (isNewGen) {
      if (!affiliatedCollege || !String(affiliatedCollege).trim()) {
        return res.status(400).json({ message: "Affiliated College is required for New Gen colleges" });
      }
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { college, upiId, affiliatedCollege: isNewGen ? String(affiliatedCollege).trim() : null } },
      { new: true }
    ).select("-password");
    return res.json({ message: "Verification details updated", user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// 👤 GET LOGGED IN USER'S TICKETS & COLLEGE REQUESTS
exports.getMyRequests = async (req, res) => {
  try {
    const SupportTicket = require("../models/SupportTicket");
    const CollegeRequest = require("../models/CollegeRequest");
    const email = req.user.email;

    const tickets = await SupportTicket.find({ email: { $regex: `^${email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, $options: "i" } }).sort({ createdAt: -1 });
    const requests = await CollegeRequest.find({ requesterEmail: { $regex: `^${email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, $options: "i" } }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      tickets,
      requests
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

