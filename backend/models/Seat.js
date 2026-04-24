const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    className: { type: String, required: true, unique: true, trim: true },
    totalSeats: { type: Number, required: true, min: 1 },
    availableSeats: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Seat", seatSchema);
