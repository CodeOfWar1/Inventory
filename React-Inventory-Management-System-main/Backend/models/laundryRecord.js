const mongoose = require("mongoose");
const { LAUNDRY_GROUPS } = require("../constants/workflow");

const LaundryRecordSchema = new mongoose.Schema(
  {
    tailoringRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tailoring_records",
      required: true,
    },
    quantityLaundered: { type: Number, required: true, min: 0 },
    laundryGroup: { type: String, enum: LAUNDRY_GROUPS, required: true },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("laundry_records", LaundryRecordSchema);
