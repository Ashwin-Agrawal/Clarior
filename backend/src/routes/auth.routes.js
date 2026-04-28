const express = require("express");
const router = express.Router();

const { register, login ,logout} = require("../controllers/auth.controller");
const { validateRegistration, validateLogin } = require("../middleware/validation.middleware");

router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);
router.get("/logout", logout);

module.exports = router;