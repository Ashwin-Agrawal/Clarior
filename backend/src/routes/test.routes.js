const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

router.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed protected route 🎉",
    user: req.user,
  });
});

module.exports = router;