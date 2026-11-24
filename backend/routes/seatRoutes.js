const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getSeatAvailability,
  validateSelectedSeats
} = require("../controllers/seatController");

// Protected routes: Requires authenticated user session
router.get("/:busId", protect, getSeatAvailability);
router.post("/validate", protect, validateSelectedSeats);

module.exports = router;

