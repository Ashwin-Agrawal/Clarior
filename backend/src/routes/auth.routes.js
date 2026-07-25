const express = require("express");
const router = express.Router();

const { register, login, logout, googleConfig, googleLogin, resetPasswordWithPhoneToken } = require("../controllers/auth.controller");
const { validateRegistration, validateLogin } = require("../middleware/validation.middleware");

router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);
router.post("/reset-password-phone", resetPasswordWithPhoneToken);
router.get("/logout", logout);

router.get("/google-config", googleConfig);
router.post("/google", googleLogin);

module.exports = router;