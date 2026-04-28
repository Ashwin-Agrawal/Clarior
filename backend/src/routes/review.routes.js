const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { addReview, getSeniorReviews, deleteReview } = require("../controllers/review.controller");

router.post("/", authMiddleware, addReview);
router.get("/:seniorId", getSeniorReviews);
router.delete("/:reviewId", authMiddleware, deleteReview);

module.exports = router;