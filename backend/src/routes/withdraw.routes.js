const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const {
  requestWithdraw,
  approveWithdraw,
  rejectWithdraw,
  getPendingWithdraws,
  getMyWithdraws,
} = require("../controllers/withdraw.controller");

//  SENIOR & ALUMNI REQUEST
router.post(
  "/request",
  authMiddleware,
  authorizeRoles("senior", "alumni"),
  requestWithdraw
);

//  SENIOR & ALUMNI VIEW OWN WITHDRAWS
router.get(
  "/my",
  authMiddleware,
  authorizeRoles("senior", "alumni"),
  getMyWithdraws
);

//  ADMIN APPROVE
router.patch(
  "/approve/:id",
  authMiddleware,
  authorizeRoles("admin"),
  approveWithdraw
);

//  ADMIN REJECT
router.patch(
  "/reject/:id",
  authMiddleware,
  authorizeRoles("admin"),
  rejectWithdraw
);

//  ADMIN GET PENDING
router.get(
  "/pending",
  authMiddleware,
  authorizeRoles("admin"),
  getPendingWithdraws
);

module.exports = router;