const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  getAllSeniors,
  updateProfile,
  updateUpi,
  getMe
} = require("../controllers/user.controller");

// ✏️ PROFILE
router.patch("/profile", authMiddleware, updateProfile);

// 💰 UPI
router.patch("/upi", authMiddleware, updateUpi);

// 🌍 PUBLIC
router.get("/seniors", getAllSeniors);
// 👤 GET CURRENT USER
router.get("/me", authMiddleware, getMe);


module.exports = router;