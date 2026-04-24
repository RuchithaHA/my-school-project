const express = require("express");
const mongoose = require("mongoose");
const Seat = require("../models/Seat");
const { memorySeats } = require("../store/memoryStore");

const router = express.Router();

// Returns seats for all configured classes.
router.get("/", async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(memorySeats);
    }

    const seats = await Seat.find().sort({ className: 1 });
    return res.json(seats);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch seats", error: err.message });
  }
});

module.exports = router;
