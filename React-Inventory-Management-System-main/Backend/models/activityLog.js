const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
  {
    actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true }, // e.g. "create"
    entityType: { type: String, required: true }, // e.g. "material_intake"
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    message: { type: String, default: "" },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("activity_logs", ActivityLogSchema);
