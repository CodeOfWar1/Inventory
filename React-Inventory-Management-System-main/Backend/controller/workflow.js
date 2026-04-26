const MaterialIntake = require("../models/materialIntake");
const MaterialAssignment = require("../models/materialAssignment");
const DesignerOutput = require("../models/designerOutput");
const ProductionBatch = require("../models/productionBatch");
const TailoringRecord = require("../models/tailoringRecord");
const LaundryRecord = require("../models/laundryRecord");
const StorageRecord = require("../models/storageRecord");
const ShopDistribution = require("../models/shopDistribution");
const { ROLES } = require("../constants/workflow");
const ActivityLog = require("../models/activityLog");

const badRequest = (res, message) => res.status(400).json({ message });

const createMaterialIntake = async (req, res) => {
  try {
    const intake = await MaterialIntake.create({
      ...req.body,
      receivedBy: req.userId || null,
    });

    if (req.userId) {
      await ActivityLog.create({
        actorUserId: req.userId,
        actorRole: req.userRole,
        action: "create",
        entityType: "material_intake",
        entityId: intake._id,
        message: "Material intake recorded",
        meta: { rows: intake.rows, color: intake.color },
      });
    }
    return res.status(201).json(intake);
  } catch (err) {
    return badRequest(res, err.message);
  }
};

const assignMaterial = async (req, res) => {
  try {
    const intake = await MaterialIntake.findById(req.body.materialIntakeId);
    if (!intake) return badRequest(res, "Material intake not found");
    const assignedAgg = await MaterialAssignment.aggregate([
      { $match: { materialIntakeId: intake._id } },
      { $group: { _id: "$materialIntakeId", total: { $sum: "$rowsAssigned" } } },
    ]);
    const alreadyAssigned = assignedAgg[0]?.total || 0;
    const remainingRows = (intake.rows || 0) - alreadyAssigned;
    if (Number(req.body.rowsAssigned || 0) > remainingRows) {
      return badRequest(res, "Assigned rows cannot exceed remaining rows on this intake");
    }

    const assignment = await MaterialAssignment.create({
      ...req.body,
      assignedBy: req.userId || null,
    });

    if (req.userId) {
      await ActivityLog.create({
        actorUserId: req.userId,
        actorRole: req.userRole,
        action: "create",
        entityType: "material_assignment",
        entityId: assignment._id,
        message: "Material assigned to designer group",
        meta: {
          materialIntakeId: assignment.materialIntakeId,
          assignedGroup: assignment.assignedGroup,
          rowsAssigned: assignment.rowsAssigned,
        },
      });
    }
    return res.status(201).json(assignment);
  } catch (err) {
    return badRequest(res, err.message);
  }
};

const createDesignerOutput = async (req, res) => {
  try {
    const assignment = await MaterialAssignment.findById(req.body.assignmentId);
    if (!assignment) return badRequest(res, "Material assignment not found");

    const existing = await DesignerOutput.findOne({ assignmentId: req.body.assignmentId });
    if (existing) return badRequest(res, "Designer output already exists for this assignment");

    // Factory rule: prevent over-cutting relative to assigned fabric rows.
    // Default: 1 row = 1 item (override with env to match factory reality).
    const piecesPerRow = Number(process.env.PIECES_PER_ROW || 1);
    if (!Number.isFinite(piecesPerRow) || piecesPerRow <= 0) {
      return badRequest(res, "Invalid server configuration: PIECES_PER_ROW must be a positive number");
    }
    const maxPieces = (assignment.rowsAssigned || 0) * piecesPerRow;
    const itemsCut = Number(req.body.itemsCut || 0);
    if (itemsCut > maxPieces) {
      return badRequest(
        res,
        `Items cut (${itemsCut}) cannot exceed max allowed (${maxPieces}) for ${assignment.rowsAssigned} assigned rows`
      );
    }

    const output = await DesignerOutput.create({
      ...req.body,
      enteredBy: req.userId || null,
    });

    if (req.userId) {
      await ActivityLog.create({
        actorUserId: req.userId,
        actorRole: req.userRole,
        action: "create",
        entityType: "designer_output",
        entityId: output._id,
        message: "Designer output recorded",
        meta: { assignmentId: output.assignmentId, itemsCut: output.itemsCut, designerGroup: output.designerGroup },
      });
    }
    return res.status(201).json(output);
  } catch (err) {
    return badRequest(res, err.message);
  }
};

const createProductionBatch = async (req, res) => {
  try {
    const designerOutput = await DesignerOutput.findById(req.body.designerOutputId);
    if (!designerOutput) return badRequest(res, "Designer output not found");

    const existing = await ProductionBatch.findOne({ designerOutputId: req.body.designerOutputId });
    if (existing) return badRequest(res, "Production batch already exists for this designer output");

    const itemsProduced = Number(req.body.itemsProduced || 0);
    if (itemsProduced > (designerOutput.itemsCut || 0)) {
      return badRequest(res, "Items produced cannot exceed items cut");
    }

    const batch = await ProductionBatch.create({
      ...req.body,
      recordedBy: req.userId || null,
    });

    if (req.userId) {
      await ActivityLog.create({
        actorUserId: req.userId,
        actorRole: req.userRole,
        action: "create",
        entityType: "production_batch",
        entityId: batch._id,
        message: "Production batch recorded",
        meta: { designerOutputId: batch.designerOutputId, itemsProduced: batch.itemsProduced },
      });
    }
    return res.status(201).json(batch);
  } catch (err) {
    return badRequest(res, err.message);
  }
};

const createTailoringRecord = async (req, res) => {
  try {
    const batch = await ProductionBatch.findById(req.body.productionBatchId);
    if (!batch) return badRequest(res, "Production batch not found");

    const existing = await TailoringRecord.findOne({ productionBatchId: req.body.productionBatchId });
    if (existing) return badRequest(res, "Tailoring record already exists for this production batch");

    const qty = Number(req.body.quantityTailored || 0);
    if (qty > (batch.itemsProduced || 0)) {
      return badRequest(res, "Quantity tailored cannot exceed items produced");
    }

    const tailoring = await TailoringRecord.create({
      ...req.body,
      tailoredBy: req.userId || null,
    });

    if (req.userId) {
      await ActivityLog.create({
        actorUserId: req.userId,
        actorRole: req.userRole,
        action: "create",
        entityType: "tailoring_record",
        entityId: tailoring._id,
        message: "Tailoring record created",
        meta: { productionBatchId: tailoring.productionBatchId, quantityTailored: tailoring.quantityTailored },
      });
    }
    return res.status(201).json(tailoring);
  } catch (err) {
    return badRequest(res, err.message);
  }
};

const createLaundryRecord = async (req, res) => {
  try {
    const tailoring = await TailoringRecord.findById(req.body.tailoringRecordId);
    if (!tailoring) return badRequest(res, "Tailoring record not found");

    const existing = await LaundryRecord.findOne({ tailoringRecordId: req.body.tailoringRecordId });
    if (existing) return badRequest(res, "Laundry record already exists for this tailoring record");

    const qty = Number(req.body.quantityLaundered || 0);
    if (qty > (tailoring.quantityTailored || 0)) {
      return badRequest(res, "Quantity laundered cannot exceed quantity tailored");
    }

    const laundry = await LaundryRecord.create({
      ...req.body,
      processedBy: req.userId || null,
    });

    if (req.userId) {
      await ActivityLog.create({
        actorUserId: req.userId,
        actorRole: req.userRole,
        action: "create",
        entityType: "laundry_record",
        entityId: laundry._id,
        message: "Laundry record created",
        meta: { tailoringRecordId: laundry.tailoringRecordId, quantityLaundered: laundry.quantityLaundered, group: laundry.laundryGroup },
      });
    }
    return res.status(201).json(laundry);
  } catch (err) {
    return badRequest(res, err.message);
  }
};

const createStorageRecord = async (req, res) => {
  try {
    const laundry = await LaundryRecord.findById(req.body.laundryRecordId);
    if (!laundry) return badRequest(res, "Laundry record not found");

    const existing = await StorageRecord.findOne({ laundryRecordId: req.body.laundryRecordId });
    if (existing) return badRequest(res, "Storage record already exists for this laundry record");

    const qty = Number(req.body.quantityReceived || 0);
    if (qty > (laundry.quantityLaundered || 0)) {
      return badRequest(res, "Quantity received cannot exceed quantity laundered");
    }

    const storage = await StorageRecord.create({
      ...req.body,
      storedBy: req.userId || null,
    });

    if (req.userId) {
      await ActivityLog.create({
        actorUserId: req.userId,
        actorRole: req.userRole,
        action: "create",
        entityType: "storage_record",
        entityId: storage._id,
        message: "Storage record created",
        meta: { laundryRecordId: storage.laundryRecordId, quantityReceived: storage.quantityReceived },
      });
    }
    return res.status(201).json(storage);
  } catch (err) {
    return badRequest(res, err.message);
  }
};

const distributeToShop = async (req, res) => {
  try {
    const storage = await StorageRecord.findById(req.body.storageRecordId);
    if (!storage) return badRequest(res, "Storage record not found");
    const distributed = await ShopDistribution.aggregate([
      { $match: { storageRecordId: storage._id } },
      { $group: { _id: "$storageRecordId", total: { $sum: "$quantitySent" } } },
    ]);
    const alreadySent = distributed[0]?.total || 0;
    const remaining = (storage.quantityReceived || 0) - alreadySent;
    if (req.body.quantitySent > remaining) {
      return badRequest(res, "Cannot distribute more than remaining stored quantity");
    }

    const distribution = await ShopDistribution.create({
      ...req.body,
      dispatchedBy: req.userId || null,
    });

    if (req.userId) {
      await ActivityLog.create({
        actorUserId: req.userId,
        actorRole: req.userRole,
        action: "create",
        entityType: "shop_distribution",
        entityId: distribution._id,
        message: "Distributed items to shop",
        meta: { storageRecordId: distribution.storageRecordId, shopName: distribution.shopName, quantitySent: distribution.quantitySent, remainingAfter: remaining - distribution.quantitySent },
      });
    }
    return res.status(201).json(distribution);
  } catch (err) {
    return badRequest(res, err.message);
  }
};

const listActivity = async (req, res) => {
  const role = req.userRole;
  const filter = {};
  if (role !== ROLES.DIRECTOR && role !== ROLES.STORE_MANAGER) {
    filter.actorUserId = req.userId;
  }
  const rows = await ActivityLog.find(filter).sort({ createdAt: -1 }).limit(100);
  return res.json(rows);
};

const getPipelineOverview = async (_req, res) => {
  const [materials, assignments, designerOutputs, batches, tailorings, laundries, storages, distributions] =
    await Promise.all([
      MaterialIntake.countDocuments(),
      MaterialAssignment.countDocuments(),
      DesignerOutput.countDocuments(),
      ProductionBatch.countDocuments(),
      TailoringRecord.countDocuments(),
      LaundryRecord.countDocuments(),
      StorageRecord.countDocuments(),
      ShopDistribution.countDocuments(),
    ]);

  return res.json({
    materials,
    assignments,
    designerOutputs,
    productionBatches: batches,
    tailoringRecords: tailorings,
    laundryRecords: laundries,
    storageRecords: storages,
    shopDistributions: distributions,
  });
};

const getShopStock = async (_req, res) => {
  const grouped = await ShopDistribution.aggregate([
    {
      $group: {
        _id: "$shopName",
        totalSent: { $sum: "$quantitySent" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return res.json(grouped);
};

const listMaterialIntakes = async (_req, res) => {
  const rows = await MaterialIntake.aggregate([
    { $sort: { createdAt: -1 } },
    { $limit: 200 },
    {
      $lookup: {
        from: "material_assignments",
        localField: "_id",
        foreignField: "materialIntakeId",
        as: "assignments",
      },
    },
    { $addFields: { assignedRowsTotal: { $sum: "$assignments.rowsAssigned" } } },
    { $addFields: { remainingRows: { $subtract: ["$rows", "$assignedRowsTotal"] } } },
    { $project: { assignments: 0 } },
  ]);
  return res.json(rows);
};

const listAssignments = async (req, res) => {
  const role = req.userRole;
  const filter = {};
  if (role === ROLES.DESIGNER) {
    const group = req.user?.designerGroup;
    if (group) filter.assignedGroup = group;
  }
  const rows = await MaterialAssignment.find(filter).sort({ createdAt: -1 }).limit(200);
  return res.json(rows);
};

const listPendingAssignments = async (req, res) => {
  const role = req.userRole;
  const filter = {};
  if (role === ROLES.DESIGNER) {
    const group = req.user?.designerGroup;
    if (group) filter.assignedGroup = group;
  }

  const processed = await DesignerOutput.distinct("assignmentId");
  const rows = await MaterialAssignment.find({
    ...filter,
    _id: { $nin: processed },
  })
    .sort({ createdAt: -1 })
    .limit(200);
  return res.json(rows);
};

const listDesignerOutputs = async (_req, res) => {
  const rows = await DesignerOutput.find().sort({ createdAt: -1 }).limit(200);
  return res.json(rows);
};

const listPendingDesignerOutputs = async (_req, res) => {
  const processed = await ProductionBatch.distinct("designerOutputId");
  const rows = await DesignerOutput.find({ _id: { $nin: processed } })
    .sort({ createdAt: -1 })
    .limit(200);
  return res.json(rows);
};

const listProductionBatches = async (_req, res) => {
  const rows = await ProductionBatch.find().sort({ createdAt: -1 }).limit(200);
  return res.json(rows);
};

const listPendingProductionBatches = async (_req, res) => {
  const processed = await TailoringRecord.distinct("productionBatchId");
  const rows = await ProductionBatch.find({ _id: { $nin: processed } })
    .sort({ createdAt: -1 })
    .limit(200);
  return res.json(rows);
};

const listTailoringRecords = async (_req, res) => {
  const rows = await TailoringRecord.find().sort({ createdAt: -1 }).limit(200);
  return res.json(rows);
};

const listPendingTailoringRecords = async (_req, res) => {
  const processed = await LaundryRecord.distinct("tailoringRecordId");
  const rows = await TailoringRecord.find({ _id: { $nin: processed } })
    .sort({ createdAt: -1 })
    .limit(200);
  return res.json(rows);
};

const listLaundryRecords = async (_req, res) => {
  const rows = await LaundryRecord.find().sort({ createdAt: -1 }).limit(200);
  return res.json(rows);
};

const listPendingLaundryRecords = async (_req, res) => {
  const processed = await StorageRecord.distinct("laundryRecordId");
  const rows = await LaundryRecord.find({ _id: { $nin: processed } })
    .sort({ createdAt: -1 })
    .limit(200);
  return res.json(rows);
};

const listStorageRecords = async (_req, res) => {
  const rows = await StorageRecord.find().sort({ createdAt: -1 }).limit(200);
  return res.json(rows);
};

const listStorageRecordsForDispatch = async (_req, res) => {
  const rows = await StorageRecord.aggregate([
    { $sort: { createdAt: -1 } },
    { $limit: 200 },
    {
      $lookup: {
        from: "shop_distributions",
        localField: "_id",
        foreignField: "storageRecordId",
        as: "dists",
      },
    },
    {
      $addFields: {
        distributedQty: { $sum: "$dists.quantitySent" },
      },
    },
    {
      $addFields: {
        remainingQty: { $subtract: ["$quantityReceived", "$distributedQty"] },
      },
    },
    { $match: { remainingQty: { $gt: 0 } } },
    {
      $project: {
        dists: 0,
      },
    },
  ]);
  return res.json(rows);
};

module.exports = {
  createMaterialIntake,
  assignMaterial,
  createDesignerOutput,
  createProductionBatch,
  createTailoringRecord,
  createLaundryRecord,
  createStorageRecord,
  distributeToShop,
  getPipelineOverview,
  getShopStock,
  listMaterialIntakes,
  listAssignments,
  listPendingAssignments,
  listDesignerOutputs,
  listPendingDesignerOutputs,
  listProductionBatches,
  listPendingProductionBatches,
  listTailoringRecords,
  listPendingTailoringRecords,
  listLaundryRecords,
  listPendingLaundryRecords,
  listStorageRecords,
  listStorageRecordsForDispatch,
  listActivity,
};
