const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Payment Issue", "Booking Problem", "General Inquiry", "Other"],
    default: "General Inquiry",
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["open", "resolved"],
    default: "open",
  },
}, { timestamps: true });

supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ email: 1 });

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
