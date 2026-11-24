const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createBooking,
  getMyBookings,
  getBookingDetails,
  cancelBooking
} = require("../controllers/bookingController");

// All booking routes require authenticated session
router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.get("/:bookingId", protect, getBookingDetails);
router.patch("/:bookingId/cancel", protect, cancelBooking);

module.exports = router;

