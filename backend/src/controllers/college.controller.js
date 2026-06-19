const College = require("../models/College");
const User = require("../models/User");
const Slot = require("../models/Slots");
const Booking = require("../models/Booking");

// 🎯 Get all colleges — supports searching by name/city and filtering by state/type
exports.getAllColleges = async (req, res) => {
  try {
    const { q, state, type } = req.query;
    const query = {};

    if (q && String(q).trim()) {
      const regexVal = { $regex: String(q).trim(), $options: "i" };
      query.$or = [
        { name: regexVal },
        { city: regexVal }
      ];
    }

    if (state && String(state).trim()) {
      query.state = { $regex: `^${String(state).trim()}$`, $options: "i" };
    }

    if (type && String(type).trim()) {
      query.type = { $regex: `^${String(type).trim()}$`, $options: "i" };
    }

    // Fetch colleges
    const colleges = await College.find(query).sort({ name: 1 });

    // Optimize: Fetch all verified seniors and count in memory to avoid N+1 queries
    const verifiedSeniors = await User.find({ role: "senior", isVerified: true }).select("college");
    const seniorCountMap = {};

    for (const s of verifiedSeniors) {
      if (s.college && typeof s.college === "string") {
        const key = s.college.trim().toLowerCase();
        seniorCountMap[key] = (seniorCountMap[key] || 0) + 1;
      }
    }

    const collegesWithSeniors = colleges.map((c) => {
      const key = (c.name && typeof c.name === "string") ? c.name.trim().toLowerCase() : "";
      return {
        ...c.toObject(),
        seniorCount: key ? (seniorCountMap[key] || 0) : 0
      };
    });

    res.status(200).json({
      success: true,
      count: collegesWithSeniors.length,
      colleges: collegesWithSeniors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 🎯 Get single college by ID — returns college metadata + verified seniors list
exports.getCollegeById = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require("mongoose");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid college ID" });
    }

    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({ success: false, message: "College not found" });
    }

    // Find all verified seniors whose college name matches (case-insensitive)
    const seniors = await User.find({
      role: "senior",
      isVerified: true,
      college: { $regex: `^${college.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, $options: "i" }
    }).select("name college affiliatedCollege branch domain bio rating numReviews isVerified year linkedin sessionsCompleted");

    // Fetch active slot count for each senior
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
      college,
      seniors: seniorsWithSlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 🎯 Get global stats of colleges, seniors and bookings
exports.getGlobalStats = async (req, res) => {
  try {
    const collegesCount = await College.countDocuments();
    const seniorsCount = await User.countDocuments({ role: "senior", isVerified: true });
    const sessionsCount = await Booking.countDocuments({ status: { $ne: "cancelled" } });

    res.status(200).json({
      success: true,
      collegesCount,
      seniorsCount,
      sessionsCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 🎯 Request a new College (Public)
exports.requestCollege = async (req, res) => {
  try {
    const { name, city, state, type, established, requesterEmail } = req.body;
    const CollegeRequest = require("../models/CollegeRequest");
    const emailService = require("../services/email.service");

    if (!name || !city || !state) {
      return res.status(400).json({
        success: false,
        message: "College Name, City, and State are required fields.",
      });
    }

    const requestObj = await CollegeRequest.create({
      name,
      city,
      state,
      type: type || "Private",
      established: established ? parseInt(established) : undefined,
      requesterEmail,
    });

    // Fire email notification in background
    emailService.sendCollegeRequestNotification(requestObj).catch((err) => {
      console.error("Failed to send college request email notification:", err.message);
    });

    res.status(201).json({
      success: true,
      message: "College request submitted successfully.",
      request: requestObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🎯 Get all College requests (Admin Only)
exports.getCollegeRequests = async (req, res) => {
  try {
    const CollegeRequest = require("../models/CollegeRequest");
    const requests = await CollegeRequest.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🎯 Approve College Request (Admin Only — Creates College automatically)
exports.approveCollegeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const CollegeRequest = require("../models/CollegeRequest");

    const requestObj = await CollegeRequest.findById(requestId);
    if (!requestObj) {
      return res.status(404).json({
        success: false,
        message: "College request not found",
      });
    }

    if (requestObj.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "This request has already been approved",
      });
    }

    // Mark request as approved/completed only (College is added manually by admin)
    requestObj.status = "approved";
    await requestObj.save();

    res.json({
      success: true,
      message: "College request marked as approved/completed.",
      request: requestObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🎯 Reject College Request (Admin Only)
exports.rejectCollegeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const CollegeRequest = require("../models/CollegeRequest");

    const requestObj = await CollegeRequest.findByIdAndUpdate(
      requestId,
      { $set: { status: "rejected" } },
      { new: true }
    );

    if (!requestObj) {
      return res.status(404).json({
        success: false,
        message: "College request not found",
      });
    }

    res.json({
      success: true,
      message: "College request rejected",
      request: requestObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


