const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  verifyTicket,
  checkInPassenger,
  getTicketsByBooking,
  getRecentTickets
} = require("../controllers/ticketController");

// Verification and check-in endpoints
router.get("/recent", getRecentTickets);
router.post("/verify", verifyTicket);
router.post("/check-in", checkInPassenger);
router.get("/booking/:bookingId", protect, getTicketsByBooking);

module.exports = router;

