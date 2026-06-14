const College = require("../models/College");
const User = require("../models/User");
const Slot = require("../models/Slots");

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
      if (s.college) {
        const key = s.college.trim().toLowerCase();
        seniorCountMap[key] = (seniorCountMap[key] || 0) + 1;
      }
    }

    const collegesWithSeniors = colleges.map((c) => {
      const key = c.name.trim().toLowerCase();
      return {
        ...c.toObject(),
        seniorCount: seniorCountMap[key] || 0
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
    }).select("name college branch domain bio rating numReviews isVerified year linkedin sessionsCompleted");

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
