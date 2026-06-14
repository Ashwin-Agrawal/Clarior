const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  senior: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    unique: true,
    sparse: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: String,
},{ timestamps: true });

// Create indexes for faster queries
reviewSchema.index({ senior: 1 });
reviewSchema.index({ student: 1 });
reviewSchema.index({ booking: 1 }, { unique: true, sparse: true });
reviewSchema.index({ senior: 1, student: 1 });

module.exports = mongoose.model("Review", reviewSchema);
