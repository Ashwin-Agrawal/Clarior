const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const {
  createTicket,
  getAllTickets,
  resolveTicket,
  getMyTickets,
} = require("../controllers/support.controller");

//  PUBLIC — Submit ticket
router.post("/", createTicket);

//  USER — view own tickets
router.get("/my-tickets", authMiddleware, getMyTickets);

//  ADMIN ONLY — Manage tickets
router.get("/admin/tickets", authMiddleware, authorizeRoles("admin"), getAllTickets);
router.patch("/admin/tickets/:ticketId/resolve", authMiddleware, authorizeRoles("admin"), resolveTicket);

module.exports = router;
