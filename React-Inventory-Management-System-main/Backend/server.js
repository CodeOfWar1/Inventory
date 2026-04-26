const express = require("express");
require("dotenv").config();
const { main, isDbConnected } = require("./models/index");
const productRoute = require("./router/product");
const storeRoute = require("./router/store");
const purchaseRoute = require("./router/purchase");
const salesRoute = require("./router/sales");
const workflowRoute = require("./router/workflow");
const cors = require("cors");
const User = require("./models/users");
const Product = require("./models/Product");
const { ROLES } = require("./constants/workflow");
const jwt = require("jsonwebtoken");
const { requireAuth } = require("./middleware/auth");
const bcrypt = require("bcryptjs");


const app = express();
const PORT = process.env.PORT || 3000;
main();
app.use(express.json());
app.use(cors());

// Store API
app.use("/api/store", storeRoute);

// Products API
app.use("/api/product", productRoute);

// Purchase API
app.use("/api/purchase", purchaseRoute);

// Sales API
app.use("/api/sales", salesRoute);

// Workflow API
app.use("/api/workflow", workflowRoute);

app.get("/api/roles", (_req, res) => {
  return res.json(Object.values(ROLES));
});

// ------------- Signin --------------
app.post("/api/login", async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ message: "Database unavailable. Try again shortly." });
  }

  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const submittedPassword = String(req.body.password || "");
    const storedPassword = String(user.password || "");
    const isHashed = storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$");
    const ok = isHashed
      ? await bcrypt.compare(submittedPassword, storedPassword)
      : submittedPassword === storedPassword;

    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Auto-upgrade legacy plaintext passwords to bcrypt on successful login.
    if (!isHashed) {
      user.password = await bcrypt.hash(submittedPassword, 10);
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET || "dev_secret_change_me",
      { expiresIn: "8h" }
    );

    return res.status(200).json({ token, user });
  } catch (error) {
    console.log("Login error:", error);
    return res.status(500).json({ message: "Unable to login" });
  }
});
// ------------------------------------

app.get("/api/session/me", requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

// Registration API
app.post("/api/register", async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ message: "Database unavailable. Try again shortly." });
  }

  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const registerUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: await bcrypt.hash(String(req.body.password || ""), 10),
      phoneNumber: req.body.phoneNumber,
      imageUrl: req.body.imageUrl,
      role: req.body.role || ROLES.DIRECTOR,
      designerGroup: req.body.designerGroup || "",
    });

    const result = await registerUser.save();
    return res.status(201).json(result);
  } catch (err) {
    console.log("Signup error:", err);
    return res.status(500).json({ message: "Unable to register user" });
  }
});


app.get("/testget", async (req, res) => {
  const result = await Product.findOne({ _id: '6429979b2e5434138eda1564' })
  res.json(result)

})

// Here we are listening to the server
app.listen(PORT, () => {
  console.log("I am live again");
});
