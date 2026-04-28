const mongoose = require("mongoose");

const googleTokenSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      default: "google",
      unique: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    accessToken: String,
    expiryDate: Number,
    scope: String,
    tokenType: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoogleToken", googleTokenSchema);

