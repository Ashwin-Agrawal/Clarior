const { body, validationResult } = require("express-validator");

// 🔥 VALIDATION MIDDLEWARE
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array()
    });
  }
  next();
};

// 🔐 REGISTRATION VALIDATION
const validateRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email must be less than 255 characters")
    .withMessage("Please provide a valid email"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage("Password must contain uppercase, lowercase, number, and special character"),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),

  body("role")
    .optional()
    .isIn(["student", "senior"])
    .withMessage("Role must be student or senior"),

  body("college")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("College name too long"),

  body("domain")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Domain too long"),

  body("branch")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Branch too long"),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio must be less than 500 characters"),

  body("linkedin")
    .optional()
    .trim()
    .isURL()
    .isLength({ max: 255 })
    .withMessage("Please provide a valid LinkedIn URL"),

  handleValidationErrors
];

// 🔐 LOGIN VALIDATION
const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  handleValidationErrors
];

// 🎓 BOOKING VALIDATION
const validateBooking = [
  body("slotId")
    .isMongoId()
    .withMessage("Invalid slot ID"),

  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateBooking,
  handleValidationErrors
};