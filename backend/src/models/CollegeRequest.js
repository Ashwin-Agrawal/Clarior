const mongoose = require("mongoose");

const collegeRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
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
  type: {
    type: String,
    required: true,
    enum: ["Private", "Government", "New Gen"],
    default: "Private",
  },
  established: {
    type: Number,
  },
  requesterEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
}, { timestamps: true });

collegeRequestSchema.index({ status: 1 });
collegeRequestSchema.index({ name: 1, city: 1 }, { unique: false });

module.exports = mongoose.model("CollegeRequest", collegeRequestSchema);
