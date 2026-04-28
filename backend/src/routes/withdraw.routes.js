const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const {
  requestWithdraw,
  approveWithdraw,
  rejectWithdraw,
} = require("../controllers/withdraw.controller");

// 🎓 SENIOR REQUEST
router.post(
  "/request",
  authMiddleware,
  authorizeRoles("senior"),
  requestWithdraw
);

// 👑 ADMIN APPROVE
router.patch(
  "/approve/:id",
  authMiddleware,
  authorizeRoles("admin"),
  approveWithdraw
);

// 👑 ADMIN REJECT
router.patch(
  "/reject/:id",
  authMiddleware,
  authorizeRoles("admin"),
  rejectWithdraw
);

module.exports = router;