const Review = require("../models/Review");
const User = require("../models/User");
const Booking = require("../models/Booking");


// ⭐ ADD REVIEW (ONLY AFTER SESSION)
exports.addReview = async (req, res) => {
  try {
    const { seniorId, rating, comment } = req.body;

    // � Validate inputs
    if (!seniorId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Senior ID and rating are required"
      });
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5"
      });
    }

    if (comment && typeof comment !== "string") {
      return res.status(400).json({
        success: false,
        message: "Comment must be a string"
      });
    }

    if (comment && comment.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment must be less than 1000 characters"
      });
    }

    // 🔍 check senior exists
    const senior = await User.findById(seniorId);
    if (!senior || senior.role !== "senior") {
      return res.status(404).json({
        success: false,
        message: "Senior not found",
      });
    }

    // 🔒 check booking exists (ONLY AFTER COMPLETION)
    const booking = await Booking.findOne({
      student: req.user.id,
      senior: seniorId,
      status: "completed",
    });

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: "You can review only after a confirmed session",
      });
    }

    // ❌ prevent multiple reviews
    const existingReview = await Review.findOne({
      student: req.user.id,
      senior: seniorId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this senior",
      });
    }

    // ⭐ create review
    const review = await Review.create({
      student: req.user.id,
      senior: seniorId,
      rating,
      comment: comment ? comment.trim() : null,
    });

    // 📊 recalculate rating
    const reviews = await Review.find({ senior: seniorId });

    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = total / reviews.length;

    await User.findByIdAndUpdate(seniorId, {
      rating: avgRating,
      numReviews: reviews.length,
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: review,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// 📖 GET REVIEWS FOR A SENIOR
exports.getSeniorReviews = async (req, res) => {
  try {
    const { seniorId } = req.params;

    const reviews = await Review.find({ senior: seniorId })
      .populate("student", "name") // optional
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ❌ DELETE REVIEW (ONLY OWNER OR ADMIN)
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // 🔒 only owner or admin
    if (
      review.student.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await review.deleteOne();

    // 🔄 recalc rating
    const reviews = await Review.find({ senior: review.senior });

    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating =
      reviews.length > 0 ? total / reviews.length : 0;

    await User.findByIdAndUpdate(review.senior, {
      rating: avgRating,
      numReviews: reviews.length,
    });

    res.json({
      success: true,
      message: "Review deleted",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};