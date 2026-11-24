const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true
  },
  bookingCode: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  busId: {
    type: Number,
    required: true
  },
  passengerName: {
    type: String,
    required: true,
    trim: true
  },
  passengerAge: {
    type: Number,
    required: true
  },
  passengerGender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Other"]
  },
  seatNumber: {
    type: String,
    required: true,
    trim: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  journeyDate: {
    type: String,
    required: true
  },
  departureTime: {
    type: String,
    default: "00:00"
  },
  arrivalTime: {
    type: String,
    default: "00:00"
  },
  ticketPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["confirmed", "cancelled"],
    default: "confirmed"
  },
  verificationStatus: {
    type: String,
    enum: ["not_checked", "checked_in"],
    default: "not_checked"
  },
  checkedInAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Ticket", ticketSchema);

