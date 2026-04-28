const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // 🔥 READ FROM HTTP-ONLY COOKIE INSTEAD OF HEADER
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;