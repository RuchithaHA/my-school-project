const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const morgan = require("morgan");
const admissionsRoutes = require("./routes/admissions");
const seatsRoutes = require("./routes/seats");
const Seat = require("./models/Seat");

dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 5000;

// Enables JSON body parsing for API endpoints.
app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/admissions", admissionsRoutes);
app.use("/api/seats", seatsRoutes);

// Stores baseline seat availability for Nursery to Grade 12.
async function seedSeatsIfNeeded() {
  const defaults = [
    ["Nursery", 40, 18],
    ["KG", 40, 12],
    ["Grade 1", 45, 15],
    ["Grade 2", 45, 10],
    ["Grade 3", 45, 8],
    ["Grade 4", 45, 13],
    ["Grade 5", 45, 14],
    ["Grade 6", 45, 9],
    ["Grade 7", 45, 11],
    ["Grade 8", 45, 7],
    ["Grade 9", 40, 6],
    ["Grade 10", 40, 5],
    ["Grade 11", 35, 9],
    ["Grade 12", 35, 4],
  ];

  for (const [className, totalSeats, availableSeats] of defaults) {
    await Seat.updateOne(
      { className },
      { $setOnInsert: { className, totalSeats, availableSeats } },
      { upsert: true }
    );
  }
}

// Connects to MongoDB and starts the HTTP server.
async function bootstrap() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI missing in root .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    await seedSeatsIfNeeded();
    console.log("MongoDB connected successfully.");
  } catch (err) {
    console.error("MongoDB unavailable, using in-memory fallback:", err.message);
  }

  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

bootstrap();
