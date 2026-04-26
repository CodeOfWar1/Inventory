const mongoose = require("mongoose");

const StorageRecordSchema = new mongoose.Schema(
  {
    laundryRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "laundry_records",
      required: true,
    },
    quantityReceived: { type: Number, required: true, min: 0 },
    ironingDone: { type: Boolean, default: false },
    packagingDone: { type: Boolean, default: false },
    sizes: [{ type: String, required: true }],
    storedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("storage_records", StorageRecordSchema);
