const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const { getAuthUrl, oauthCallback, status } = require("../controllers/google.controller");

// Platform account connect flow should be restricted.
router.get("/auth-url", authMiddleware, authorizeRoles("admin"), getAuthUrl);
router.get("/callback", oauthCallback);
router.get("/status", authMiddleware, authorizeRoles("admin"), status);

module.exports = router;

