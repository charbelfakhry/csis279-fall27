const express = require("express");

const userController = require("../controllers/user.controller");
const requirePermission = require("../middleware/permission.middleware");

const router = express.Router();

router.get("/", requirePermission("users:read"), userController.getAllUsers);
router.get("/:id", requirePermission("users:read"), userController.getUserById);
router.post("/", requirePermission("users:create"), userController.createUser);
router.put("/:id", requirePermission("users:update"), userController.updateUser);
router.delete("/:id", requirePermission("users:delete"), userController.deleteUser)
router.put("/:id/roles", requirePermission("roles:manage"), userController.updateUserRoles);


module.exports = router;
