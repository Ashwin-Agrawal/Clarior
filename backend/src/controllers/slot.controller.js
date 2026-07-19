const Slot = require("../models/Slots");
const mongoose = require("mongoose");

const parseTimeToMinutes = (time) => {
  const match = time.match(/^(\d{1,2}):(\d{2})(?:-(\d{1,2}):(\d{2}))?$/);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour > 23 || minute > 59) return null;

  return hour * 60 + minute;
};

const validateSlotDateTime = (dateValue, timeValue) => {
  if (!dateValue || typeof dateValue !== "string") {
    return { valid: false, message: "Invalid date format" };
  }

  const dateParts = dateValue.split("-").map(Number);
  if (dateParts.length !== 3 || dateParts.some(isNaN)) {
    return { valid: false, message: "Invalid date format" };
  }

  const [year, month, day] = dateParts;
  const slotDate = new Date(Date.UTC(year, month - 1, day));
  if (isNaN(slotDate.getTime())) {
    return { valid: false, message: "Invalid date format" };
  }

  // Validate time format and bounds (HH:MM) for all dates
  const startMinutes = parseTimeToMinutes(timeValue);
  if (startMinutes === null) {
    return { valid: false, message: "Invalid time format (use HH:MM or HH:MM-HH:MM)" };
  }

  // Shift current time to IST (UTC+5:30)
  const now = new Date();
  const nowIST = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

  // Normalize today start in IST using UTC components on the shifted Date
  const todayIST = new Date(Date.UTC(
    nowIST.getUTCFullYear(),
    nowIST.getUTCMonth(),
    nowIST.getUTCDate()
  ));

  if (slotDate < todayIST) {
    return { valid: false, message: "Slot date must be today or in the future" };
  }

  if (slotDate.getTime() === todayIST.getTime()) {
    const currentMinutes = nowIST.getUTCHours() * 60 + nowIST.getUTCMinutes();
    if (startMinutes <= currentMinutes) {
      return { valid: false, message: "Slot time must be in the future for today" };
    }
  }

  return { valid: true, slotDate };
};

exports.validateSlotDateTime = validateSlotDateTime;

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

    const dateValidation = validateSlotDateTime(date, time);
    if (!dateValidation.valid) {
      return res.status(400).json({
        success: false,
        message: dateValidation.message,
      });
    }

    // Fix 6a: Use Date object for duplicate check to avoid type mismatch
    const dateObj = dateValidation.slotDate;
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

    const [h, m] = time.split("-")[0].split(":").map(Number);
    const dateTimeObj = new Date(dateObj);
    dateTimeObj.setUTCHours(h, m, 0, 0);
    dateTimeObj.setTime(dateTimeObj.getTime() - 5.5 * 60 * 60 * 1000);

    // Fix 6a: Store dateObj (Date) instead of raw string
    const slot = await Slot.create({
      senior: req.user.id,
      date: dateObj,
      time,
      dateTime: dateTimeObj,
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

      if (!/^\d{1,2}:\d{2}(-\d{1,2}:\d{2})?$/.test(time)) {
        return res.status(400).json({ success: false, message: `Invalid time format: ${time}` });
      }

      const dateValidation = validateSlotDateTime(date, time);
      if (!dateValidation.valid) {
        return res.status(400).json({ success: false, message: `${dateValidation.message}: ${date}` });
      }

      const slotDate = dateValidation.slotDate;
      const exists = await Slot.findOne({
        senior: req.user.id,
        date: slotDate,
        time,
      });

      if (!exists) {
        const [h, m] = time.split("-")[0].split(":").map(Number);
        const dateTimeObj = new Date(slotDate);
        dateTimeObj.setUTCHours(h, m, 0, 0);
        dateTimeObj.setTime(dateTimeObj.getTime() - 5.5 * 60 * 60 * 1000);

        newSlots.push({
          senior: req.user.id,
          date: slotDate,
          time,
          dateTime: dateTimeObj,
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
    const slots = await Slot.find({
      isBooked: false,
      dateTime: { $gt: new Date() }
    }).populate({
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
exports.getSlotsBySenior = async (req, res, next) => {
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

    if (!isRequestingSelf || req.query.available === "true") {
      query.isBooked = false;
      query.dateTime = { $gt: new Date() };
    }

    const slots = await Slot.find(query).sort({ date: 1 }).lean();

    let resultSlots = slots;
    if (isRequestingSelf) {
      const Booking = require("../models/Booking");
      const bookedSlotIds = slots.filter(s => s.isBooked).map(s => s._id);

      const bookings = await Booking.find({ slot: { $in: bookedSlotIds } })
        .populate("student", "name email")
        .lean();

      const bookingMap = bookings.reduce((acc, curr) => {
        if (curr.slot) {
          acc[curr.slot.toString()] = curr;
        }
        return acc;
      }, {});

      resultSlots = slots.map((slot) => {
        if (slot.isBooked) {
          const booking = bookingMap[slot._id.toString()];
          return {
            ...slot,
            booking: booking ? {
              _id: booking._id,
              studentName: booking.student?.name || "Student",
              studentEmail: booking.student?.email || "",
              meetLink: booking.meetLink || "",
              status: booking.status
            } : null
          };
        }
        return slot;
      });
    }

    res.json({
      success: true,
      slots: resultSlots,
    });
  } catch (err) {
    next(err);
  }
};

// 👨‍🏫 Delete/Cancel slot by senior (with booking refund if booked)
exports.deleteSlot = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid slot ID" });
    }

    const slot = await Slot.findById(id).session(session);
    if (!slot) {
      return res.status(404).json({ success: false, message: "Slot not found" });
    }

    // Check ownership
    if (slot.senior.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You are not authorized to delete this slot" });
    }

    let bookingCancelled = false;

    if (slot.isBooked) {
      const Booking = require("../models/Booking");
      const User = require("../models/User");
      
      const booking = await Booking.findOne({ slot: slot._id, status: { $ne: "cancelled" } }).session(session);
      if (booking) {
        if (booking.status === "completed") {
          return res.status(400).json({ success: false, message: "Cannot cancel a slot for a completed booking" });
        }
        if (booking.isCallStarted) {
          return res.status(400).json({ success: false, message: "Cannot cancel a slot for an active call" });
        }

        // Cancel the booking
        booking.status = "cancelled";
        await booking.save({ session });

        // Refund the student's credit
        await User.updateOne(
          { _id: booking.student },
          { $inc: { callCredits: 1 } }
        ).session(session);

        bookingCancelled = true;
      }
    }

    // Now delete the slot
    await Slot.deleteOne({ _id: slot._id }).session(session);

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: bookingCancelled
        ? "Slot deleted and booking cancelled. Student credit refunded."
        : "Slot deleted successfully.",
    });
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};
