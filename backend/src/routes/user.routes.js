const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const {
  getAllSeniors,
  applySenior,
  updateProfile,
  updateUpi,
  getMe,
  getSeniorById,
  updateVerificationDetails,
  getMyRequests,
} = require("../controllers/user.controller");

// 🧑‍🏫 APPLY FOR SENIOR ROLE
router.post("/apply-senior", authMiddleware, applySenior);
router.post("/become-senior", authMiddleware, applySenior);

// ✏️ PROFILE
router.patch("/profile", authMiddleware, updateProfile);

// 💰 UPI
router.patch("/upi", authMiddleware, updateUpi);

// 🌍 PUBLIC — all verified seniors list
router.get("/seniors", getAllSeniors);

// Fix 10: PUBLIC — get single senior by ID (no auth required)
router.get("/seniors/:id", getSeniorById);

// 👤 GET CURRENT USER'S TICKETS & REQUESTS
router.get("/me/requests", authMiddleware, getMyRequests);

// 👤 GET CURRENT USER
router.get("/me", authMiddleware, getMe);

// Fix 12: PATCH /verification-details — seniors only, updates college + upiId atomically
router.patch("/verification-details", authMiddleware, authorizeRoles("senior"), updateVerificationDetails);


module.exports = router;
