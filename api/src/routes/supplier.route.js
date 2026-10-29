const express = require("express");

const supplierController = require("../controllers/supplier.controller");
const requirePermission = require("../middleware/permission.middleware");

const router = express.Router();

router.get("/", requirePermission("suppliers:read"), supplierController.getAllSuppliers);
router.get("/:id", requirePermission("suppliers:read"), supplierController.getSupplierById);
router.post("/", requirePermission("suppliers:create"), supplierController.createSupplier);
router.put("/:id", requirePermission("suppliers:update"), supplierController.updateSupplier);
router.delete("/:id", requirePermission("suppliers:delete"), supplierController.deleteSupplier);


module.exports = router;
