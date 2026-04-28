const Slot = require("../models/Slots");

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

    // 🔒 prevent duplicate slot for same senior
    const existing = await Slot.findOne({
      senior: req.user.id,
      date,
      time,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Slot already exists",
      });
    }

    const slot = await Slot.create({
      senior: req.user.id,
      date,
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

// 👨‍🏫 Create multiple slots (BULK)
exports.createSlots = async (req, res) => {
  try {
    const { slots } = req.body;

    // remove duplicates before inserting
    const newSlots = [];

    for (let slot of slots) {
      const exists = await Slot.findOne({
        senior: req.user.id,
        date: slot.date,
        time: slot.time,
      });

      if (!exists) {
        newSlots.push({
          senior: req.user.id,
          date: slot.date,
          time: slot.time,
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

// 🎯 Get slots of specific senior
exports.getSlotsBySenior = async (req, res) => {
  try {
    const { id } = req.params;

    const slots = await Slot.find({
      senior: id,
      isBooked: false,
    }).sort({ date: 1 });

    res.json({
      success: true,
      slots,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};