const express = require("express");

const productController = require("../controllers/product.controller");
const requirePermission = require("../middleware/permission.middleware");

const router = express.Router();

router.get("/", requirePermission("products:read"), productController.getAllProducts);
router.get("/:id", requirePermission("products:read"), productController.getProductById);
router.post("/", requirePermission("products:create"), productController.createProduct);
router.put("/:id", requirePermission("products:update"), productController.updateProduct);
router.delete("/:id", requirePermission("products:delete"), productController.deleteProduct)


module.exports = router;
