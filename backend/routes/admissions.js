const express = require("express");
const mongoose = require("mongoose");
const Admission = require("../models/Admission");
const { memoryAdmissions } = require("../store/memoryStore");

const router = express.Router();

// Validates required fields and basic data shape.
function validateAdmissionPayload(payload) {
  const requiredFields = [
    "studentName",
    "dateOfBirth",
    "gender",
    "classApplyingFor",
    "parentName",
    "parentEmail",
    "parentPhone",
    "currentSchool",
    "address",
  ];

  for (const field of requiredFields) {
    if (!payload[field] || String(payload[field]).trim() === "") {
      return `${field} is required`;
    }
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.parentEmail);
  if (!emailOk) return "parentEmail format is invalid";

  const phoneOk = /^[0-9+\-\s()]{8,20}$/.test(payload.parentPhone);
  if (!phoneOk) return "parentPhone format is invalid";

  return null;
}

// Creates a new admission application.
router.post("/", async (req, res) => {
  try {
    const error = validateAdmissionPayload(req.body);
    if (error) return res.status(400).json({ message: error });

    if (mongoose.connection.readyState !== 1) {
      const created = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...req.body,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      memoryAdmissions.unshift(created);
      return res.status(201).json(created);
    }

    const created = await Admission.create(req.body);
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create admission", error: err.message });
  }
});

// Gets all applications sorted by newest first.
router.get("/", async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(memoryAdmissions);
    }

    const records = await Admission.find().sort({ createdAt: -1 });
    return res.json(records);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch admissions", error: err.message });
  }
});

// Updates only status for admission workflow.
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid admission id" });
    }
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (mongoose.connection.readyState !== 1) {
      const index = memoryAdmissions.findIndex((item) => item._id === id);
      if (index < 0) return res.status(404).json({ message: "Admission not found" });
      memoryAdmissions[index] = { ...memoryAdmissions[index], status };
      return res.json(memoryAdmissions[index]);
    }

    const updated = await Admission.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Admission not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update admission", error: err.message });
  }
});

// Deletes an admission record by id.
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid admission id" });
    }

    if (mongoose.connection.readyState !== 1) {
      const index = memoryAdmissions.findIndex((item) => item._id === id);
      if (index < 0) return res.status(404).json({ message: "Admission not found" });
      memoryAdmissions.splice(index, 1);
      return res.json({ message: "Admission deleted successfully" });
    }

    const deleted = await Admission.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Admission not found" });
    return res.json({ message: "Admission deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete admission", error: err.message });
  }
});

module.exports = router;
