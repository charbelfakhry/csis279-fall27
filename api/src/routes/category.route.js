const express = require("express");

const categoryController = require("../controllers/category.controller");
const requirePermission = require("../middleware/permission.middleware");

const router = express.Router();

router.get("/", requirePermission("categories:read"), categoryController.getAllCategories);
router.get("/:id", requirePermission("categories:read"), categoryController.getCategoryById);
router.post("/", requirePermission("categories:create"), categoryController.createCategory);
router.put("/:id", requirePermission("categories:update"), categoryController.updateCategory);
router.delete("/:id", requirePermission("categories:delete"), categoryController.deleteCategory);


module.exports = router;
