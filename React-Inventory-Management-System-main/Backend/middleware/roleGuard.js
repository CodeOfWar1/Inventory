const { ROLES } = require("../constants/workflow");
const { requireAuth } = require("./auth");

const requireRoles = (allowedRoles = []) => {
  return [
    requireAuth,
    (req, res, next) => {
      const role = req.user.role;
      if (role !== ROLES.DIRECTOR && !allowedRoles.includes(role)) {
        return res.status(403).json({ message: "Access denied for this role" });
      }

      req.userRole = role;
      req.userId = req.user._id;
      return next();
    },
  ];
};

module.exports = { requireRoles };
