const mongoose = require("mongoose");

const MaterialAssignmentSchema = new mongoose.Schema(
  {
    materialIntakeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "material_intakes",
      required: true,
    },
    assignedGroup: { type: String, required: true },
    rowsAssigned: { type: Number, required: true, min: 1 },
    assignmentDate: { type: Date, required: true, default: Date.now },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("material_assignments", MaterialAssignmentSchema);
