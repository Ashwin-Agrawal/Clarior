const Slot = require("../models/Slots");
const mongoose = require("mongoose");

// 👨‍🏫 Create single slot
exports.createSlot = async (req, res) => {
  try {
    const { date, time } = req.body;

    // 🔒 Validate inputs
    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: "Date and time are required",
      });
    }

    // 🔒 Validate date format and ensure it's in the future
    const slotDate = new Date(date);
    if (isNaN(slotDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (slotDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Slot date must be in the future",
      });
    }

    // 🔒 Validate time format (HH:MM or HH:MM-HH:MM)
    if (!/^\d{1,2}:\d{2}(-\d{1,2}:\d{2})?$/.test(time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time format (use HH:MM or HH:MM-HH:MM)",
      });
    }

    if (time.length > 20) {
      return res.status(400).json({
        success: false,
        message: "Time string too long",
      });
    }

    // Fix 6a: Use Date object for duplicate check to avoid type mismatch
    const dateObj = new Date(date);
    const existing = await Slot.findOne({
      senior: req.user.id,
      date: dateObj,
      time,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Slot already exists",
      });
    }

    // Fix 6a: Store dateObj (Date) instead of raw string
    const slot = await Slot.create({
      senior: req.user.id,
      date: dateObj,
      time,
    });

    res.status(201).json({
      success: true,
      message: "Slot created",
      slot,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 👨‍🏫 Create multiple slots (BULK) — Fix 6c: add date/time validation
exports.createSlots = async (req, res) => {
  try {
    const { slots } = req.body;

    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ success: false, message: "slots array is required" });
    }

    // remove duplicates before inserting
    const newSlots = [];

    for (let slot of slots) {
      const { date, time } = slot;

      // Fix 6c: Validate each slot's date and time
      if (!date || !time) {
        return res.status(400).json({ success: false, message: "Each slot must have date and time" });
      }

      const slotDate = new Date(date);
      if (isNaN(slotDate.getTime())) {
        return res.status(400).json({ success: false, message: `Invalid date format: ${date}` });
      }

      if (slotDate < new Date()) {
        return res.status(400).json({ success: false, message: `Slot date must be in the future: ${date}` });
      }

      if (!/^\d{1,2}:\d{2}(-\d{1,2}:\d{2})?$/.test(time)) {
        return res.status(400).json({ success: false, message: `Invalid time format: ${time}` });
      }

      const exists = await Slot.findOne({
        senior: req.user.id,
        date: slotDate,
        time,
      });

      if (!exists) {
        newSlots.push({
          senior: req.user.id,
          date: slotDate,
          time,
        });
      }
    }

    const createdSlots = await Slot.insertMany(newSlots);

    res.status(201).json({
      success: true,
      message: "Slots created",
      count: createdSlots.length,
      slots: createdSlots,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🌍 Get all available slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const slots = await Slot.find({ isBooked: false }).populate({
      path: "senior",
      match: { isVerified: true },
      select: "name college linkedin rating isAnonymous",
    });

    const filteredSlots = slots.filter(slot => slot.senior);

    const formattedSlots = filteredSlots.map((slot) => {
      const user = slot.senior;

      let seniorData = {
        id: user._id,
        rating: user.rating,
      };

      if (!user.isAnonymous) {
        seniorData.name = user.name;
        seniorData.college = user.college;
        seniorData.linkedin = user.linkedin;
      }

      return {
        ...slot._doc,
        senior: seniorData,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedSlots.length,
      slots: formattedSlots,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🎯 Get slots of specific senior — Fix 6b: ObjectId validation
exports.getSlotsBySenior = async (req, res) => {
  try {
    const { id } = req.params;

    // Fix 6b: Validate ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid senior ID" });
    }

    let query = { senior: id };

    // Check if request is from the senior themselves (to return booked/past slots as well)
    const jwt = require("jsonwebtoken");
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    let isRequestingSelf = false;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id === id) {
          isRequestingSelf = true;
        }
      } catch (err) {}
    }

    if (!isRequestingSelf) {
      query.isBooked = false;
    }

    const slots = await Slot.find(query).sort({ date: 1 }).lean();

    let resultSlots = slots;
    if (isRequestingSelf) {
      const Booking = require("../models/Booking");
      resultSlots = await Promise.all(
        slots.map(async (slot) => {
          if (slot.isBooked) {
            const booking = await Booking.findOne({ slot: slot._id })
              .populate("student", "name email")
              .lean();
            return {
              ...slot,
              booking: booking ? {
                _id: booking._id,
                studentName: booking.student?.name || "Student",
                studentEmail: booking.student?.email || "",
                meetLink: booking.meetLink || ""
              } : null
            };
          }
          return slot;
        })
      );
    }

    res.json({
      success: true,
      slots: resultSlots,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
