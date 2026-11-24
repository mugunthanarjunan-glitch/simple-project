const Ticket = require("../models/Ticket");
const Booking = require("../models/Booking");
const QRCode = require("../utils/qrcode");

/**
 * API: Verify Ticket (for Conductor)
 * Route: POST /api/tickets/verify
 * Body: { ticketId }
 */
exports.verifyTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;

    if (!ticketId || typeof ticketId !== "string" || !ticketId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Ticket ID is required for verification."
      });
    }

    const cleanTicketId = ticketId.trim();

    // Find ticket in MongoDB
    const ticket = await Ticket.findOne({ ticketId: cleanTicketId });
    if (!ticket) {
      return res.status(404).json({
        success: false,
        verdict: "INVALID",
        message: `Ticket ID "${cleanTicketId}" was not found in the booking database.`
      });
    }

    // Determine verdict
    let verdict = "VALID";
    let message = "Ticket is valid and ready for check-in.";

    if (ticket.status === "cancelled") {
      verdict = "CANCELLED";
      message = "WARNING: This ticket was cancelled by the passenger.";
    } else if (ticket.verificationStatus === "checked_in") {
      verdict = "ALREADY_CHECKED_IN";
      message = `NOTICE: Passenger was already checked in on ${new Date(ticket.checkedInAt).toLocaleString()}.`;
    }

    return res.status(200).json({
      success: true,
      verdict,
      message,
      ticket
    });
  } catch (error) {
    console.error("Ticket verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred during ticket verification."
    });
  }
};

/**
 * API: Check In Passenger (for Conductor)
 * Route: POST /api/tickets/check-in
 * Body: { ticketId }
 */
exports.checkInPassenger = async (req, res) => {
  try {
    const { ticketId } = req.body;

    if (!ticketId || typeof ticketId !== "string" || !ticketId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Ticket ID is required to perform check-in."
      });
    }

    const cleanTicketId = ticketId.trim();

    const ticket = await Ticket.findOne({ ticketId: cleanTicketId });
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket ID "${cleanTicketId}" does not exist.`
      });
    }

    if (ticket.status === "cancelled") {
      return res.status(400).json({
        success: false,
        verdict: "CANCELLED",
        message: "Cannot check in passenger. This ticket is cancelled."
      });
    }

    if (ticket.verificationStatus === "checked_in") {
      return res.status(400).json({
        success: false,
        verdict: "ALREADY_CHECKED_IN",
        message: `Passenger already checked in at ${new Date(ticket.checkedInAt).toLocaleString()}.`
      });
    }

    // Perform check-in
    ticket.verificationStatus = "checked_in";
    ticket.checkedInAt = new Date();
    await ticket.save();

    return res.status(200).json({
      success: true,
      verdict: "CHECKED_IN_SUCCESS",
      message: `Passenger ${ticket.passengerName} (Seat ${ticket.seatNumber}) successfully checked in!`,
      ticket
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred during passenger check-in."
    });
  }
};

/**
 * API: Get Tickets for a Booking
 * Route: GET /api/tickets/booking/:bookingId
 */
exports.getTicketsByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking ${bookingId} not found.`
      });
    }

    const tickets = await Ticket.find({ bookingId: booking._id });

    // Generate QR codes for each ticket
    const ticketsWithQR = await Promise.all(
      tickets.map(async (t) => {
        const qrPayload = JSON.stringify({ ticketId: t.ticketId });
        const qrCode = await QRCode.toDataURL(qrPayload);
        return {
          ...t.toObject(),
          qrCode
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: ticketsWithQR.length,
      tickets: ticketsWithQR
    });
  } catch (error) {
    console.error("Error fetching booking tickets:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving tickets."
    });
  }
};



/**
 * API: Get Recent Tickets (for Conductor quick testing)
 * Route: GET /api/tickets/recent
 */
exports.getRecentTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 }).limit(6);
    return res.status(200).json({
      success: true,
      tickets
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching recent tickets."
    });
  }
};
