const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const {
  getAllUsers,
  getPendingSeniors,
  verifySenior,
  deleteUser,
  grantCredits,
  fastForwardBooking,
  getPendingReleases,
  releaseEarnings,
} = require("../controllers/admin.controller");

// 🔐 only admin
router.use(authMiddleware, authorizeRoles("admin"));

router.get("/users", getAllUsers);
router.get("/pending-seniors", getPendingSeniors);
router.patch("/verify/:userId", verifySenior);
router.delete("/user/:userId", deleteUser);
router.post("/grant-credits/:userId", grantCredits);
router.post("/test/fast-forward-booking/:bookingId", fastForwardBooking);

router.get("/pending-releases", getPendingReleases);
router.patch("/release-earnings/:bookingId", releaseEarnings);

module.exports = router;