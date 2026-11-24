const buses = require("../data/buses");
const SeatAvailability = require("../models/SeatAvailability");

/**
 * Controller to search buses based on from, to, and date query parameters.
 * Route: GET /api/buses/search
 */
exports.searchBuses = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    // 1. Validate required query parameters
    if (!from || !to || !date) {
      return res.status(400).json({
        success: false,
        message: "From city, To city, and Journey date are required."
      });
    }

    const trimmedFrom = from.trim();
    const trimmedTo = to.trim();
    const trimmedDate = date.trim();

    // 2. Validate that From and To are different
    if (trimmedFrom.toLowerCase() === trimmedTo.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "From and To cities cannot be the same."
      });
    }

    // 3. Validate journey date (cannot be in the past)
    const dateParts = trimmedDate.split("-").map(Number);
    if (
      dateParts.length !== 3 ||
      isNaN(dateParts[0]) ||
      isNaN(dateParts[1]) ||
      isNaN(dateParts[2])
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid journey date format. Please use YYYY-MM-DD."
      });
    }

    const journeyDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    journeyDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(journeyDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid journey date provided."
      });
    }

    if (journeyDate < today) {
      return res.status(400).json({
        success: false,
        message: "Journey date cannot be in the past."
      });
    }

    // 4. Filter hardcoded bus array by source and destination
    const matchingBuses = buses.filter(
      (bus) =>
        bus.from.toLowerCase() === trimmedFrom.toLowerCase() &&
        bus.to.toLowerCase() === trimmedTo.toLowerCase()
    );

    // 5. Query MongoDB for booked seats on this journey date
    const busIds = matchingBuses.map((bus) => bus.id);
    const availabilityRecords = await SeatAvailability.find({
      busId: { $in: busIds },
      journeyDate: trimmedDate
    });

    const availabilityMap = new Map();
    availabilityRecords.forEach((record) => {
      availabilityMap.set(record.busId, record.bookedSeats.length);
    });

    const busesWithSeats = matchingBuses.map((bus) => {
      const bookedCount = availabilityMap.get(bus.id) || 0;
      const availableSeats = Math.max(0, (bus.totalSeats || 40) - bookedCount);
      return {
        ...bus,
        availableSeats
      };
    });

    return res.status(200).json({
      success: true,
      message:
        busesWithSeats.length > 0
          ? "Buses found successfully"
          : "No buses available for this route.",
      count: busesWithSeats.length,
      buses: busesWithSeats
    });
  } catch (error) {
    console.error("Bus search error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while searching buses."
    });
  }
};

