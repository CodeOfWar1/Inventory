const mongoose = require("mongoose");

const TailoringRecordSchema = new mongoose.Schema(
  {
    productionBatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "production_batches",
      required: true,
    },
    quantityTailored: { type: Number, required: true, min: 0 },
    sizes: [{ type: String, required: true }],
    tailoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("tailoring_records", TailoringRecordSchema);
