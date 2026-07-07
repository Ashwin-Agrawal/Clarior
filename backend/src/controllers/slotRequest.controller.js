const SlotRequest = require("../models/SlotRequest");
const Slot = require("../models/Slots");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Create a custom slot request
// @route   POST /api/slot-requests
// @access  Private (Student only)
exports.createSlotRequest = async (req, res) => {
  try {
    const { seniorId, preferredDate, preferredTime, notes } = req.body;

    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can request slots" });
    }

    if (!seniorId || !preferredDate || !preferredTime) {
      return res.status(400).json({ message: "Senior ID, preferred date, and preferred time period are required" });
    }

    const senior = await User.findOne({ _id: seniorId, role: "senior" });
    if (!senior) {
      return res.status(404).json({ message: "Senior not found" });
    }

    const requestDate = new Date(preferredDate);
    const now = new Date();
    // Normalize date to compare
    now.setHours(0,0,0,0);
    requestDate.setHours(0,0,0,0);

    if (requestDate < now) {
      return res.status(400).json({ message: "Preferred date must be in the future" });
    }

    const slotRequest = await SlotRequest.create({
      student: req.user.id,
      senior: seniorId,
      preferredDate: requestDate,
      preferredTime,
      notes,
    });

    // Notify senior in-app
    try {
      const studentUser = await User.findById(req.user.id);
      await Notification.create({
        recipient: seniorId,
        title: "New Custom Slot Request",
        message: `${studentUser.name} requested a custom slot on ${requestDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} during the ${preferredTime}.`,
        type: "system"
      });
    } catch (err) {
      console.error("Failed to create slot request notification:", err.message);
    }

    return res.status(201).json({
      message: "Slot request submitted successfully",
      slotRequest,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc    Get user's slot requests
// @route   GET /api/slot-requests
// @access  Private
exports.getSlotRequests = async (req, res) => {
  try {
    let requests;
    if (req.user.role === "senior") {
      requests = await SlotRequest.find({ senior: req.user.id })
        .populate("student", "name email college branch year")
        .sort({ createdAt: -1 });
    } else {
      requests = await SlotRequest.find({ student: req.user.id })
        .populate("senior", "name email college branch year domain bio")
        .sort({ createdAt: -1 });
    }

    return res.json({ requests });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc    Accept or Decline a slot request
// @route   PATCH /api/slot-requests/:id/status
// @access  Private (Senior only)
exports.updateSlotRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== "senior") {
      return res.status(403).json({ message: "Only seniors can respond to requests" });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be either accepted or rejected" });
    }

    const slotRequest = await SlotRequest.findOne({ _id: id, senior: req.user.id });
    if (!slotRequest) {
      return res.status(404).json({ message: "Slot request not found" });
    }

    if (slotRequest.status !== "pending") {
      return res.status(400).json({ message: "Request has already been processed" });
    }

    slotRequest.status = status;
    await slotRequest.save();

    const seniorUser = await User.findById(req.user.id);
    const dateStr = new Date(slotRequest.preferredDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

    if (status === "accepted") {
      // Map preferredTime period to a default exact time string
      const defaultTimeMap = {
        morning: "10:00",
        afternoon: "15:00",
        evening: "18:00",
      };
      const exactTime = defaultTimeMap[slotRequest.preferredTime] || "18:00";

      // 1. Automatically create the slot
      const dateObj = new Date(slotRequest.preferredDate);
      
      // Check if slot already exists to prevent duplicate entries
      const existingSlot = await Slot.findOne({
        senior: req.user.id,
        date: dateObj,
        time: exactTime,
      });

      if (!existingSlot) {
        await Slot.create({
          senior: req.user.id,
          date: dateObj,
          time: exactTime,
          isBooked: false,
        });
      }

      // 2. Notify student in-app
      try {
        await Notification.create({
          recipient: slotRequest.student,
          title: "Slot Request Accepted!",
          message: `${seniorUser.name} accepted your request. A slot on ${dateStr} at ${exactTime} has been added. Book it now!`,
          type: "system"
        });
      } catch (err) {
        console.error("Failed to notify student of slot acceptance:", err.message);
      }
    } else {
      // Notify student of rejection
      try {
        await Notification.create({
          recipient: slotRequest.student,
          title: "Slot Request Declined",
          message: `${seniorUser.name} was unable to accept your request for a slot on ${dateStr} (${slotRequest.preferredTime}).`,
          type: "system"
        });
      } catch (err) {
        console.error("Failed to notify student of slot rejection:", err.message);
      }
    }

    return res.json({
      message: `Slot request ${status} successfully`,
      slotRequest,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
