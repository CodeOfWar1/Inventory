const express = require("express");
const app = express();
const workflow = require("../controller/workflow");
const { requireRoles } = require("../middleware/roleGuard");
const { ROLES } = require("../constants/workflow");

app.post(
  "/materials/intake",
  requireRoles([ROLES.WAREHOUSE_MANAGER]),
  workflow.createMaterialIntake
);

app.post(
  "/materials/assign",
  requireRoles([ROLES.WAREHOUSE_MANAGER]),
  workflow.assignMaterial
);

app.post(
  "/designers/output",
  requireRoles([ROLES.DESIGNER]),
  workflow.createDesignerOutput
);

app.post(
  "/production/batches",
  requireRoles([ROLES.PRODUCTION_TRACKER]),
  workflow.createProductionBatch
);

app.post(
  "/tailoring/records",
  requireRoles([ROLES.TAILOR]),
  workflow.createTailoringRecord
);

app.post(
  "/laundry/records",
  requireRoles([ROLES.LAUNDRY]),
  workflow.createLaundryRecord
);

app.post(
  "/storage/records",
  requireRoles([ROLES.STORE_MANAGER]),
  workflow.createStorageRecord
);

app.post(
  "/shops/distribute",
  requireRoles([ROLES.STORE_MANAGER]),
  workflow.distributeToShop
);

app.get(
  "/pipeline/overview",
  requireRoles([
    ROLES.WAREHOUSE_MANAGER,
    ROLES.DESIGNER,
    ROLES.PRODUCTION_TRACKER,
    ROLES.TAILOR,
    ROLES.LAUNDRY,
    ROLES.STORE_MANAGER,
    ROLES.DIRECTOR,
  ]),
  workflow.getPipelineOverview
);

app.get(
  "/shops/stock",
  requireRoles([ROLES.SHOP, ROLES.STORE_MANAGER, ROLES.DIRECTOR]),
  workflow.getShopStock
);

// Read lists (for dropdowns & tables)
app.get(
  "/materials/intakes",
  requireRoles([ROLES.WAREHOUSE_MANAGER, ROLES.DIRECTOR]),
  workflow.listMaterialIntakes
);

app.get(
  "/materials/assignments",
  requireRoles([ROLES.WAREHOUSE_MANAGER, ROLES.DESIGNER, ROLES.DIRECTOR]),
  workflow.listAssignments
);

app.get(
  "/materials/assignments/pending",
  requireRoles([ROLES.DESIGNER, ROLES.WAREHOUSE_MANAGER, ROLES.DIRECTOR]),
  workflow.listPendingAssignments
);

app.get(
  "/designers/outputs",
  requireRoles([ROLES.DESIGNER, ROLES.PRODUCTION_TRACKER, ROLES.DIRECTOR]),
  workflow.listDesignerOutputs
);

app.get(
  "/designers/outputs/pending",
  requireRoles([ROLES.PRODUCTION_TRACKER, ROLES.DIRECTOR]),
  workflow.listPendingDesignerOutputs
);

app.get(
  "/production/batches",
  requireRoles([ROLES.PRODUCTION_TRACKER, ROLES.TAILOR, ROLES.DIRECTOR]),
  workflow.listProductionBatches
);

app.get(
  "/production/batches/pending",
  requireRoles([ROLES.TAILOR, ROLES.DIRECTOR]),
  workflow.listPendingProductionBatches
);

app.get(
  "/tailoring/records",
  requireRoles([ROLES.TAILOR, ROLES.LAUNDRY, ROLES.DIRECTOR]),
  workflow.listTailoringRecords
);

app.get(
  "/tailoring/records/pending",
  requireRoles([ROLES.LAUNDRY, ROLES.DIRECTOR]),
  workflow.listPendingTailoringRecords
);

app.get(
  "/laundry/records",
  requireRoles([ROLES.LAUNDRY, ROLES.STORE_MANAGER, ROLES.DIRECTOR]),
  workflow.listLaundryRecords
);

app.get(
  "/laundry/records/pending",
  requireRoles([ROLES.STORE_MANAGER, ROLES.DIRECTOR]),
  workflow.listPendingLaundryRecords
);

app.get(
  "/storage/records",
  requireRoles([ROLES.STORE_MANAGER, ROLES.SHOP, ROLES.DIRECTOR]),
  workflow.listStorageRecords
);

app.get(
  "/storage/records/dispatchable",
  requireRoles([ROLES.STORE_MANAGER, ROLES.DIRECTOR]),
  workflow.listStorageRecordsForDispatch
);

app.get(
  "/activity",
  requireRoles([ROLES.WAREHOUSE_MANAGER, ROLES.DESIGNER, ROLES.PRODUCTION_TRACKER, ROLES.TAILOR, ROLES.LAUNDRY, ROLES.STORE_MANAGER, ROLES.SHOP, ROLES.DIRECTOR]),
  workflow.listActivity
);

module.exports = app;
