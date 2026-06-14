const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Private", "Government", "New-Gen"],
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    established: {
      type: Number,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    common: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

// Create indexes for faster querying
collegeSchema.index({ city: 1 });
collegeSchema.index({ state: 1 });
collegeSchema.index({ type: 1 });

module.exports = mongoose.model("College", collegeSchema);
