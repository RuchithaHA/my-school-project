const mongoose = require("mongoose");

const admissionSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true, trim: true },
    classApplyingFor: { type: String, required: true, trim: true },
    parentName: { type: String, required: true, trim: true },
    parentEmail: { type: String, required: true, trim: true, lowercase: true },
    parentPhone: { type: String, required: true, trim: true },
    currentSchool: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    medicalConditions: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admission", admissionSchema);
