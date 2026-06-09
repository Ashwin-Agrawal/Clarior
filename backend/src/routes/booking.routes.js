const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const {
  createBooking,
  getMyBookings,
  cancelBooking,
  startCall,
  setMeetLink,
  markCompletedBySenior,
  confirmByStudent,
  getBookingById,
} = require("../controllers/booking.controller");


// 🎓 BOOK — Fix 9: students only (removed 'senior' from authorizeRoles)
router.post("/", authMiddleware, authorizeRoles("student"), createBooking);

// 📊 GET BOOKINGS
router.get("/my", authMiddleware, getMyBookings);

// ❌ CANCEL
router.delete("/:bookingId", authMiddleware, cancelBooking);

// 🚀 START CALL
router.patch(
  "/start/:bookingId",
  authMiddleware,
  authorizeRoles("student"),
  startCall
);

// 🔗 SENIOR SET MEET LINK
router.patch(
  "/meet-link/:bookingId",
  authMiddleware,
  authorizeRoles("senior"),
  setMeetLink
);

// 👨‍🏫 SENIOR COMPLETE
router.patch(
  "/senior-complete/:bookingId",
  authMiddleware,
  authorizeRoles("senior"),
  markCompletedBySenior
);

// 🎓 STUDENT CONFIRM
router.patch(
  "/student-confirm/:bookingId",
  authMiddleware,
  authorizeRoles("student"),
  confirmByStudent
);

// Fix 11: GET single booking by ID — must be AFTER /my and /meet-link to avoid conflicts
router.get("/:id", authMiddleware, getBookingById);

module.exports = router;
