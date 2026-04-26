const jwt = require("jsonwebtoken");
const User = require("../models/users");

const getTokenFromHeader = (authHeader = "") => {
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
};

const requireAuth = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req.headers.authorization || "");
    if (!token) {
      return res.status(401).json({ message: "Missing auth token" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_change_me");
    const user = await User.findById(payload.userId).select("_id role email firstName lastName imageUrl");
    if (!user) {
      return res.status(401).json({ message: "Session user not found" });
    }

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired session token" });
  }
};

module.exports = { requireAuth };
