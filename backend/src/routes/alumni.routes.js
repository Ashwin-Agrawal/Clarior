const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const alumniController = require("../controllers/alumni.controller");

// Public alumni directory & profile
router.get("/", alumniController.getAllAlumni);
router.get("/profile/:id", alumniController.getAlumniById);

// Authenticated applicant routes
router.post("/apply", authMiddleware, alumniController.applyAlumni);
router.get("/me", authMiddleware, alumniController.getMyAlumniProfile);

module.exports = router;
