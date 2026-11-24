const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
  },
  mobile: {
    type: String,
    required: [true, "Mobile number is required"],
    trim: true,
    match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    default: "user"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);