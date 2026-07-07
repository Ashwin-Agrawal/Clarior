const express = require("express");
const router = express.Router();
const { getNotifications, markRead, markAllRead } = require("../controllers/notification.controller");
const authMiddleware = require("../middleware/auth.middleware");

// All notification routes are protected
router.use(authMiddleware);

router.get("/", getNotifications);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markRead);

module.exports = router;
