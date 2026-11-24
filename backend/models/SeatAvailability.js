const mongoose = require("mongoose");

const seatAvailabilitySchema = new mongoose.Schema({
  busId: {
    type: Number,
    required: [true, "Bus ID is required"]
  },
  journeyDate: {
    type: String,
    required: [true, "Journey date is required"],
    trim: true
  },
  bookedSeats: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index ensuring only one record per bus per journey date
seatAvailabilitySchema.index({ busId: 1, journeyDate: 1 }, { unique: true });

module.exports = mongoose.model("SeatAvailability", seatAvailabilitySchema);

