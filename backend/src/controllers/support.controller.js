const SupportTicket = require("../models/SupportTicket");
const emailService = require("../services/email.service");

// 🎯 Submit a Support Ticket (Public)
exports.createTicket = async (req, res) => {
  try {
    const { name, email, category, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields.",
      });
    }

    const ticket = await SupportTicket.create({
      name,
      email,
      category,
      message,
    });

    // Fire email notification in background
    emailService.sendSupportNotification(ticket).catch((err) => {
      console.error("Failed to send support email notification:", err.message);
    });

    res.status(201).json({
      success: true,
      message: "Support ticket submitted successfully.",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🎯 Get All Tickets (Admin Only)
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🎯 Toggle Ticket Resolution Status (Admin Only)
exports.resolveTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!status || !["open", "resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status parameter. Must be 'open' or 'resolved'.",
      });
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      ticketId,
      { $set: { status } },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.json({
      success: true,
      message: `Ticket marked as ${status}`,
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
