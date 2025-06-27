const express = require("express");
const auth = require("../middleware/auth.middleware");
const checkRole = require("../middleware/checkRole.middleware");
const roles = require("../constants/roles");
const Order = require("../model/order.model");

const router = express.Router();

// ✅ Get all orders — only for admin
router.get("/order", auth, checkRole(roles.admin), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name") 
      .populate("products.productId", "title price"); 

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found!" });
    }

    res.status(200).json({ message: "Orders fetched successfully", orders });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message,
    });
  }
});

// ✅ Update order status — only for admin
router.patch("/updateStatus/:orderId", auth, checkRole(roles.admin), async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({
      message: "Error updating order status",
      error: error.message,
    });
  }
});

module.exports = router;
