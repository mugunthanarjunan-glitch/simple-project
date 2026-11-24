const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Passenger name is required"],
      trim: true
    },
    age: {
      type: Number,
      required: [true, "Passenger age is required"],
      min: [1, "Age must be at least 1"],
      max: [100, "Age cannot exceed 100"]
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["Male", "Female", "Other"],
        message: "Gender must be Male, Female, or Other"
      }
    },
    seatNumber: {
      type: String,
      required: [true, "Seat number is required"],
      trim: true
    }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User reference is required"]
  },
  busId: {
    type: Number,
    required: [true, "Bus ID is required"]
  },
  busName: {
    type: String,
    required: true
  },
  busNumber: {
    type: String,
    required: true
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
  selectedSeats: {
    type: [String],
    required: true
  },
  passengers: {
    type: [passengerSchema],
    required: true
  },
  contactEmail: {
    type: String,
    required: [true, "Contact email is required"],
    trim: true,
    lowercase: true
  },
  contactMobile: {
    type: String,
    required: [true, "Contact mobile is required"],
    trim: true
  },
  ticketPrice: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["confirmed", "cancelled"],
    default: "confirmed"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Booking", bookingSchema);

