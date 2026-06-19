const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const {
  getAllColleges,
  getCollegeById,
  getGlobalStats,
  requestCollege,
  getCollegeRequests,
  approveCollegeRequest,
  rejectCollegeRequest
} = require("../controllers/college.controller");

// 🌍 PUBLIC — global stats of colleges, seniors and bookings
router.get("/stats", getGlobalStats);

// 🌍 PUBLIC — request a new college to be added
router.post("/request", requestCollege);

// 🌍 PUBLIC — all colleges list (search/filters)
router.get("/", getAllColleges);

// 🌍 PUBLIC — single college profile & its seniors list
router.get("/:id", getCollegeById);

// 🔐 ADMIN ONLY — Manage college requests
router.get("/admin/requests", authMiddleware, authorizeRoles("admin"), getCollegeRequests);
router.patch("/admin/requests/:requestId/approve", authMiddleware, authorizeRoles("admin"), approveCollegeRequest);
router.patch("/admin/requests/:requestId/reject", authMiddleware, authorizeRoles("admin"), rejectCollegeRequest);

module.exports = router;

