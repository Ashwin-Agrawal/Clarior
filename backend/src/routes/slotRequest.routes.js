const express = require("express");
const router = express.Router();
const {
  createSlotRequest,
  getSlotRequests,
  updateSlotRequestStatus,
} = require("../controllers/slotRequest.controller");
const authMiddleware = require("../middleware/auth.middleware");

// All slot request routes are protected
router.use(authMiddleware);

router.post("/", createSlotRequest);
router.get("/", getSlotRequests);
router.patch("/:id/status", updateSlotRequestStatus);

module.exports = router;
