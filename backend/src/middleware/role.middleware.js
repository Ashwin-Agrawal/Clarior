const User = require("../models/User");

const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    try {
      // check role
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      // 🔥 EXTRA CHECK FOR SENIOR
      if (req.user.role === "senior") {
        const user = await User.findById(req.user.id);

        if (!user.isVerified) {
          return res.status(403).json({
            message: "Senior not verified",
          });
        }
      }

      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

module.exports = authorizeRoles;