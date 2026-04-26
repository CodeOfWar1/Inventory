const mongoose = require("mongoose");

const ProductionBatchSchema = new mongoose.Schema(
  {
    designerOutputId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "designer_outputs",
      required: true,
    },
    itemsProduced: { type: Number, required: true, min: 0 },
    sizes: [{ type: String, required: true }],
    cutDetails: { type: String, required: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("production_batches", ProductionBatchSchema);
