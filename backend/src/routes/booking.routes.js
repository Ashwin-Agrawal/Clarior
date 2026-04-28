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
} = require("../controllers/booking.controller");


// 🎓 BOOK
router.post("/", authMiddleware, authorizeRoles("student", "senior"), createBooking);

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

module.exports = router;