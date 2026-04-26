const mongoose = require("mongoose");
const { MATERIAL_COLORS } = require("../constants/workflow");

const MaterialIntakeSchema = new mongoose.Schema(
  {
    rows: { type: Number, required: true, min: 0 },
    color: { type: String, enum: MATERIAL_COLORS, required: true },
    zipPackets: { type: Number, required: true, min: 0, default: 0 },
    needlePackets: { type: Number, required: true, min: 0, default: 0 },
    badgePinPackets: { type: Number, required: true, min: 0, default: 0 },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("material_intakes", MaterialIntakeSchema);
