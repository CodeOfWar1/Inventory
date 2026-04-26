require("dotenv").config();
const mongoose = require("mongoose");
const { main } = require("../models/index");
const User = require("../models/users");
const MaterialIntake = require("../models/materialIntake");
const MaterialAssignment = require("../models/materialAssignment");
const DesignerOutput = require("../models/designerOutput");
const ProductionBatch = require("../models/productionBatch");
const TailoringRecord = require("../models/tailoringRecord");
const LaundryRecord = require("../models/laundryRecord");
const StorageRecord = require("../models/storageRecord");
const ShopDistribution = require("../models/shopDistribution");
const { ROLES } = require("../constants/workflow");

const shops = ["Lusaka", "Kitwe", "Solwezi", "Choma", "Chipata", "Individual Seller"];
const colors = ["white", "navy_blue", "light_blue", "sky_blue", "bsp_green", "scrap_green"];
const sizesPool = ["XS", "S", "M", "L", "XL", "2XL"];

const pickSizes = (count = 3) => sizesPool.slice(0, count);

async function ensureUsers(seedTag) {
  const users = [
    {
      firstName: "Wendy",
      lastName: "Warehouse",
      email: `warehouse_${seedTag}@demo.com`,
      password: "123456",
      phoneNumber: 260100000001,
      imageUrl: "",
      role: ROLES.WAREHOUSE_MANAGER,
    },
    {
      firstName: "Dani",
      lastName: "Designer",
      email: `designer_${seedTag}@demo.com`,
      password: "123456",
      phoneNumber: 260100000002,
      imageUrl: "",
      role: ROLES.DESIGNER,
      designerGroup: "Group 1",
    },
    {
      firstName: "Paul",
      lastName: "Production",
      email: `production_${seedTag}@demo.com`,
      password: "123456",
      phoneNumber: 260100000003,
      imageUrl: "",
      role: ROLES.PRODUCTION_TRACKER,
    },
    {
      firstName: "Tina",
      lastName: "Tailor",
      email: `tailor_${seedTag}@demo.com`,
      password: "123456",
      phoneNumber: 260100000004,
      imageUrl: "",
      role: ROLES.TAILOR,
    },
    {
      firstName: "Lara",
      lastName: "Laundry",
      email: `laundry_${seedTag}@demo.com`,
      password: "123456",
      phoneNumber: 260100000005,
      imageUrl: "",
      role: ROLES.LAUNDRY,
    },
    {
      firstName: "Stella",
      lastName: "Store",
      email: `store_${seedTag}@demo.com`,
      password: "123456",
      phoneNumber: 260100000006,
      imageUrl: "",
      role: ROLES.STORE_MANAGER,
    },
    {
      firstName: "Simon",
      lastName: "Shop",
      email: `shop_${seedTag}@demo.com`,
      password: "123456",
      phoneNumber: 260100000007,
      imageUrl: "",
      role: ROLES.SHOP,
    },
    {
      firstName: "Dora",
      lastName: "Director",
      email: `director_${seedTag}@demo.com`,
      password: "123456",
      phoneNumber: 260100000008,
      imageUrl: "",
      role: ROLES.DIRECTOR,
    },
  ];

  const created = [];
  for (const userData of users) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      created.push(existing);
    } else {
      const user = await User.create(userData);
      created.push(user);
    }
  }
  return created;
}

async function seedWorkflow(users) {
  const userMap = Object.fromEntries(users.map((u) => [u.role, u]));
  const recordsPerStage = 12;

  for (let i = 0; i < recordsPerStage; i += 1) {
    const material = await MaterialIntake.create({
      rows: 40 + i * 3,
      color: colors[i % colors.length],
      zipPackets: 10 + i,
      needlePackets: 8 + i,
      badgePinPackets: 6 + i,
      receivedBy: userMap[ROLES.WAREHOUSE_MANAGER]._id,
      notes: `Synthetic intake #${i + 1}`,
    });

    const assignment = await MaterialAssignment.create({
      materialIntakeId: material._id,
      assignedGroup: `Group ${(i % 3) + 1}`,
      rowsAssigned: 25 + i,
      assignmentDate: new Date(),
      assignedBy: userMap[ROLES.WAREHOUSE_MANAGER]._id,
      notes: `Synthetic assignment #${i + 1}`,
    });

    const output = await DesignerOutput.create({
      assignmentId: assignment._id,
      designerGroup: assignment.assignedGroup,
      itemsCut: 110 + i * 5,
      sizes: pickSizes((i % 4) + 2),
      cutType: i % 2 === 0 ? "full cut" : "partial cut",
      enteredBy: userMap[ROLES.DESIGNER]._id,
      notes: `Synthetic designer output #${i + 1}`,
    });

    const batch = await ProductionBatch.create({
      designerOutputId: output._id,
      itemsProduced: 100 + i * 4,
      sizes: output.sizes,
      cutDetails: output.cutType,
      recordedBy: userMap[ROLES.PRODUCTION_TRACKER]._id,
      notes: `Synthetic production batch #${i + 1}`,
    });

    const tailoring = await TailoringRecord.create({
      productionBatchId: batch._id,
      quantityTailored: 95 + i * 4,
      sizes: batch.sizes,
      tailoredBy: userMap[ROLES.TAILOR]._id,
      notes: `Synthetic tailoring #${i + 1}`,
    });

    const laundry = await LaundryRecord.create({
      tailoringRecordId: tailoring._id,
      quantityLaundered: 90 + i * 4,
      laundryGroup: i % 2 === 0 ? "A" : "B",
      processedBy: userMap[ROLES.LAUNDRY]._id,
      notes: `Synthetic laundry #${i + 1}`,
    });

    const storage = await StorageRecord.create({
      laundryRecordId: laundry._id,
      quantityReceived: 88 + i * 4,
      ironingDone: true,
      packagingDone: i % 2 === 0,
      sizes: laundry.quantityLaundered % 2 === 0 ? ["M", "L", "XL"] : ["S", "M", "L"],
      storedBy: userMap[ROLES.STORE_MANAGER]._id,
      notes: `Synthetic storage #${i + 1}`,
    });

    await ShopDistribution.create({
      storageRecordId: storage._id,
      shopName: shops[i % shops.length],
      quantitySent: 30 + i * 2,
      sizes: storage.sizes,
      dispatchedBy: userMap[ROLES.STORE_MANAGER]._id,
      notes: `Synthetic distribution #${i + 1}`,
    });
  }
}

async function run() {
  const seedTag = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  try {
    await main();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const users = await ensureUsers(seedTag);
    await seedWorkflow(users);

    console.log("Synthetic data seeded successfully.");
    console.log("Demo login users (password: 123456):");
    users.forEach((u) => {
      console.log(`- ${u.role}: ${u.email}`);
    });
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

run();
