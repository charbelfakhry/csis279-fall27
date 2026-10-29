const express = require("express");

const orderController = require("../controllers/order.controller");
const requirePermission = require("../middleware/permission.middleware");

const router = express.Router();

router.get("/", requirePermission("orders:read"), orderController.getAllOrders);
router.get("/:id", requirePermission("orders:read"), orderController.getOrderById);
router.post("/", requirePermission("orders:create"), orderController.createOrder);
router.put("/:id", requirePermission("orders:update"), orderController.updateOrder);
router.delete("/:id", requirePermission("orders:delete"), orderController.deleteOrder);


module.exports = router;
