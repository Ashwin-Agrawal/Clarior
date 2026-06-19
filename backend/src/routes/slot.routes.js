const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const {
  createSlot,
  createSlots,
  getAvailableSlots,
  getSlotsBySenior,
  deleteSlot,
} = require("../controllers/slot.controller");

// 🌍 Get all slots (public)
router.get("/", getAvailableSlots);

// 👨‍🏫 Create single slot (only senior)
router.post(
  "/",
  authMiddleware,
  authorizeRoles("senior"),
  createSlot
);

// 👨‍🏫 Create multiple slots (bulk)
router.post(
  "/bulk",
  authMiddleware,
  authorizeRoles("senior"),
  createSlots
);
router.get("/senior/:id", getSlotsBySenior);
router.delete("/:id", authMiddleware, authorizeRoles("senior"), deleteSlot);
module.exports = router;