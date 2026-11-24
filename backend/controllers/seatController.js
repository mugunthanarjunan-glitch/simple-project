const SeatAvailability = require("../models/SeatAvailability");
const buses = require("../data/buses");

/**
 * Generates all valid seat IDs for a standard 40-seat bus: ["S1", "S2", ..., "S40"]
 */
const ALL_VALID_SEATS = Array.from({ length: 40 }, (_, i) => `S${i + 1}`);

/**
 * API 1: Get Seat Availability
 * Route: GET /api/seats/:busId?date=YYYY-MM-DD
 */
exports.getSeatAvailability = async (req, res) => {
  try {
    const { busId } = req.params;
    const { date } = req.query;

    const numericBusId = Number(busId);
    if (!busId || isNaN(numericBusId)) {
      return res.status(400).json({
        success: false,
        message: "A valid numeric Bus ID is required."
      });
    }

    if (!date || typeof date !== "string") {
      return res.status(400).json({
        success: false,
        message: "Journey date is required (format: YYYY-MM-DD)."
      });
    }

    const journeyDate = date.trim();

    // Check if the bus exists in hardcoded bus data
    const bus = buses.find((b) => b.id === numericBusId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: `Bus with ID ${numericBusId} not found.`
      });
    }

    // Find availability document or create a new one with empty bookedSeats
    let availability = await SeatAvailability.findOne({
      busId: numericBusId,
      journeyDate
    });

    if (!availability) {
      try {
        availability = await SeatAvailability.create({
          busId: numericBusId,
          journeyDate,
          bookedSeats: []
        });
      } catch (createErr) {
        // If a duplicate key race condition happened, fetch the existing record
        if (createErr.code === 11000) {
          availability = await SeatAvailability.findOne({
            busId: numericBusId,
            journeyDate
          });
        } else {
          throw createErr;
        }
      }
    }

    const bookedSeats = availability ? availability.bookedSeats : [];
    const totalSeats = bus.totalSeats || 40;
    const availableSeats = Math.max(0, totalSeats - bookedSeats.length);

    return res.status(200).json({
      success: true,
      busId: numericBusId,
      journeyDate,
      totalSeats,
      bookedSeats,
      availableSeats
    });
  } catch (error) {
    console.error("Error retrieving seat availability:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while retrieving seat availability."
    });
  }
};

/**
 * API 2: Validate Selected Seats
 * Route: POST /api/seats/validate
 * Body: { busId, journeyDate, selectedSeats }
 */
exports.validateSelectedSeats = async (req, res) => {
  try {
    const { busId, journeyDate, selectedSeats } = req.body;

    // 1. Validate busId
    const numericBusId = Number(busId);
    if (!busId || isNaN(numericBusId)) {
      return res.status(400).json({
        success: false,
        message: "A valid numeric Bus ID is required."
      });
    }

    const bus = buses.find((b) => b.id === numericBusId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: `Bus with ID ${numericBusId} not found.`
      });
    }

    // 2. Validate journeyDate
    if (!journeyDate || typeof journeyDate !== "string" || !journeyDate.trim()) {
      return res.status(400).json({
        success: false,
        message: "Journey date is required."
      });
    }

    // 3. Ensure at least one seat is selected
    if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one seat to continue."
      });
    }

    // 4. Ensure no duplicate seat numbers exist
    const uniqueSeats = new Set(selectedSeats);
    if (uniqueSeats.size !== selectedSeats.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate seat selections detected."
      });
    }

    // 5. Ensure no more than 6 seats are selected
    if (selectedSeats.length > 6) {
      return res.status(400).json({
        success: false,
        message: "You can select a maximum of 6 seats per booking."
      });
    }

    // 6. Ensure all seat numbers are valid (S1 to S40)
    const invalidSeats = selectedSeats.filter((seat) => !ALL_VALID_SEATS.includes(seat));
    if (invalidSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid seat numbers: ${invalidSeats.join(", ")}. Valid seats are S1 to S40.`
      });
    }

    // 7. Check MongoDB bookedSeats array
    const availability = await SeatAvailability.findOne({
      busId: numericBusId,
      journeyDate: journeyDate.trim()
    });

    const bookedSeats = availability ? availability.bookedSeats : [];

    // 8. Verify none of the selected seats are already booked
    const alreadyBooked = selectedSeats.filter((seat) => bookedSeats.includes(seat));
    if (alreadyBooked.length > 0) {
      return res.status(409).json({
        success: false,
        message: `The following seat(s) are already booked: ${alreadyBooked.join(", ")}. Please select other seats.`,
        alreadyBooked
      });
    }

    const totalAmount = selectedSeats.length * bus.price;

    return res.status(200).json({
      success: true,
      message: "Selected seats are valid and available.",
      busId: numericBusId,
      journeyDate: journeyDate.trim(),
      selectedSeats,
      pricePerSeat: bus.price,
      totalAmount
    });
  } catch (error) {
    console.error("Error validating selected seats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while validating selected seats."
    });
  }
};

