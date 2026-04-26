const mongoose = require("mongoose");

const DesignerOutputSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "material_assignments",
      required: true,
    },
    designerGroup: { type: String, required: true },
    itemsCut: { type: Number, required: true, min: 0 },
    sizes: [{ type: String, required: true }],
    cutType: { type: String, required: true },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("designer_outputs", DesignerOutputSchema);
