const express = require("express");

const roleController = require("../controllers/role.controller");
const requirePermission = require("../middleware/permission.middleware");

const router = express.Router();

router.get("/", requirePermission("roles:read"), roleController.getAllRoles);
router.get("/:id", requirePermission("roles:read"), roleController.getRoleById);
router.post("/", requirePermission("roles:manage"), roleController.createRole);
router.put("/:id", requirePermission("roles:manage"), roleController.updateRole);
router.delete("/:id", requirePermission("roles:manage"), roleController.deleteRole);


module.exports = router;
