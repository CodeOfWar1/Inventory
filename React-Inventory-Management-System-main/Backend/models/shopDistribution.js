const mongoose = require("mongoose");
const { SHOPS } = require("../constants/workflow");

const ShopDistributionSchema = new mongoose.Schema(
  {
    storageRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "storage_records",
      required: true,
    },
    shopName: { type: String, enum: SHOPS, required: true },
    quantitySent: { type: Number, required: true, min: 1 },
    sizes: [{ type: String, required: true }],
    dispatchedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("shop_distributions", ShopDistributionSchema);
