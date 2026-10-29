const express = require("express");

const roleController = require("../controllers/role.controller");
const requirePermission = require("../middleware/permission.middleware");

const router = express.Router();

// read-only: permissions are added with sql/rbac.sql, together with the code that checks them
router.get("/", requirePermission("roles:read"), roleController.getAllPermissions);


module.exports = router;
