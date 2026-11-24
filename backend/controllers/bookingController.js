const Booking = require("../models/Booking");
const SeatAvailability = require("../models/SeatAvailability");
const buses = require("../data/buses");

const ALL_VALID_SEATS = Array.from({ length: 40 }, (_, i) => `S${i + 1}`);

/**
 * Generate a clean, unique RedBus booking identifier
 * Format: RB + Base36 timestamp + 4 random uppercase chars
 * e.g., RB-L9X8K2-7A9F
 */
const generateBookingId = () => {
  const timestampPart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RB-${timestampPart}-${randomPart}`;
};

/**
 * API: Create Booking
 * Route: POST /api/bookings
 * Required: Authenticated user
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      busId,
      journeyDate,
      selectedSeats,
      passengers,
      contactEmail,
      contactMobile
    } = req.body;

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to complete booking."
      });
    }

    // 1. Validate busId against hardcoded bus data
    const numericBusId = Number(busId);
    if (!busId || isNaN(numericBusId)) {
      return res.status(400).json({
        success: false,
        message: "Valid numeric Bus ID is required."
      });
    }

    const bus = buses.find((b) => b.id === numericBusId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: `Bus with ID ${numericBusId} does not exist.`
      });
    }

    // 2. Validate journeyDate
    if (!journeyDate || typeof journeyDate !== "string" || !journeyDate.trim()) {
      return res.status(400).json({
        success: false,
        message: "Journey date is required."
      });
    }
    const cleanJourneyDate = journeyDate.trim();

    // 3. Validate selectedSeats
    if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one seat must be selected."
      });
    }

    if (selectedSeats.length > 6) {
      return res.status(400).json({
        success: false,
        message: "A maximum of 6 seats can be booked per transaction."
      });
    }

    const uniqueSeats = new Set(selectedSeats);
    if (uniqueSeats.size !== selectedSeats.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate seats detected in selection."
      });
    }

    const invalidSeats = selectedSeats.filter((seat) => !ALL_VALID_SEATS.includes(seat));
    if (invalidSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid seat numbers: ${invalidSeats.join(", ")}.`
      });
    }

    // 4. Validate passengers
    if (!Array.isArray(passengers) || passengers.length !== selectedSeats.length) {
      return res.status(400).json({
        success: false,
        message: `Passenger details must be provided for all ${selectedSeats.length} selected seats.`
      });
    }

    // Validate each passenger's fields and match seat assignments
    const assignedSeats = new Set();
    const validatedPassengers = [];

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p || typeof p !== "object") {
        return res.status(400).json({
          success: false,
          message: `Passenger #${i + 1} details are incomplete.`
        });
      }

      const name = p.name?.trim();
      const age = Number(p.age);
      const gender = p.gender?.trim();
      const seatNumber = p.seatNumber?.trim();

      if (!name || name.length < 2) {
        return res.status(400).json({
          success: false,
          message: `Passenger #${i + 1} must have a valid name (at least 2 characters).`
        });
      }

      if (isNaN(age) || age < 1 || age > 100) {
        return res.status(400).json({
          success: false,
          message: `Passenger #${i + 1} (${name}) must have a valid age between 1 and 100.`
        });
      }

      if (!["Male", "Female", "Other"].includes(gender)) {
        return res.status(400).json({
          success: false,
          message: `Passenger #${i + 1} (${name}) must have gender specified as Male, Female, or Other.`
        });
      }

      if (!selectedSeats.includes(seatNumber)) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seatNumber} for passenger ${name} is not among your selected seats.`
        });
      }

      if (assignedSeats.has(seatNumber)) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seatNumber} has multiple passengers assigned.`
        });
      }

      assignedSeats.add(seatNumber);
      validatedPassengers.push({ name, age, gender, seatNumber });
    }

    // 5. Validate contact details
    if (!contactEmail || !/^\S+@\S+\.\S+$/.test(contactEmail.trim())) {
      return res.status(400).json({
        success: false,
        message: "A valid contact email address is required."
      });
    }

    if (!contactMobile || !/^[6-9]\d{9}$/.test(contactMobile.trim())) {
      return res.status(400).json({
        success: false,
        message: "A valid 10-digit mobile number starting with 6-9 is required."
      });
    }

    // 6. Hardcoded bus price & backend amount calculation (never trust frontend totals)
    const ticketPrice = bus.price;
    const totalAmount = selectedSeats.length * ticketPrice;

    // 7. Atomic Seat Reservation Strategy:
    // Ensure availability record exists
    let availability = await SeatAvailability.findOne({
      busId: bus.id,
      journeyDate: cleanJourneyDate
    });

    if (!availability) {
      try {
        availability = await SeatAvailability.create({
          busId: bus.id,
          journeyDate: cleanJourneyDate,
          bookedSeats: []
        });
      } catch (err) {
        if (err.code === 11000) {
          availability = await SeatAvailability.findOne({
            busId: bus.id,
            journeyDate: cleanJourneyDate
          });
        } else {
          throw err;
        }
      }
    }

    // Conditionally and atomically push seats ONLY IF none are in bookedSeats
    const updateResult = await SeatAvailability.updateOne(
      {
        busId: bus.id,
        journeyDate: cleanJourneyDate,
        bookedSeats: { $nin: selectedSeats }
      },
      {
        $push: { bookedSeats: { $each: selectedSeats } }
      }
    );

    // If modifiedCount is 0, another concurrent booking already reserved one or more seats
    if (updateResult.modifiedCount === 0) {
      const refreshedAvailability = await SeatAvailability.findOne({
        busId: bus.id,
        journeyDate: cleanJourneyDate
      });
      const alreadyTaken = selectedSeats.filter((seat) =>
        refreshedAvailability?.bookedSeats.includes(seat)
      );

      return res.status(409).json({
        success: false,
        message: `One or more selected seats (${alreadyTaken.join(", ")}) were just booked by another traveler. Please return to seat selection to choose available seats.`,
        conflictSeats: alreadyTaken
      });
    }

    // 8. Create Booking document with rollback on failure
    const bookingId = generateBookingId();
    let booking;

    try {
      booking = await Booking.create({
        bookingId,
        userId,
        busId: bus.id,
        busName: bus.busName,
        busNumber: bus.busNumber,
        from: bus.from,
        to: bus.to,
        journeyDate: cleanJourneyDate,
        selectedSeats,
        passengers: validatedPassengers,
        contactEmail: contactEmail.toLowerCase().trim(),
        contactMobile: contactMobile.trim(),
        ticketPrice,
        totalAmount,
        status: "confirmed"
      });
    } catch (bookingError) {
      // Rollback the reserved seats if booking creation encounters an error
      console.error("Booking creation failed, rolling back reserved seats:", bookingError);
      await SeatAvailability.updateOne(
        { busId: bus.id, journeyDate: cleanJourneyDate },
        { $pull: { bookedSeats: { $in: selectedSeats } } }
      );
      throw bookingError;
    }

    return res.status(201).json({
      success: true,
      message: "Bus ticket booked successfully!",
      booking
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred while processing your booking."
    });
  }
};

/**
 * API: Get My Bookings
 * Route: GET /api/bookings/my-bookings
 * Returns bookings belonging to authenticated user
 */
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error("Error retrieving user bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching your bookings."
    });
  }
};

/**
 * API: Get Booking by ID
 * Route: GET /api/bookings/:bookingId
 */
exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking with ID ${bookingId} not found.`
      });
    }

    // Ensure booking belongs to logged in user or admin
    const isOwner = booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this booking."
      });
    }

    return res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error("Error retrieving booking details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while retrieving ticket details."
    });
  }
};

/**
 * API: Cancel Booking
 * Route: PATCH /api/bookings/:bookingId/cancel
 * Releases reserved seats in SeatAvailability and updates status to cancelled
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking with ID ${bookingId} not found.`
      });
    }

    // Ensure booking belongs to logged in user or admin
    const isOwner = booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this booking."
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This booking has already been cancelled."
      });
    }

    // 1. Release reserved seats in SeatAvailability
    await SeatAvailability.updateOne(
      { busId: booking.busId, journeyDate: booking.journeyDate },
      { $pull: { bookedSeats: { $in: booking.selectedSeats } } }
    );

    // 2. Update booking status
    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully. Reserved seats have been released.",
      booking
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while cancelling booking."
    });
  }
};

