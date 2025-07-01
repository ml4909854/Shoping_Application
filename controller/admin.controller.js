const express = require("express");
const auth = require("../middleware/auth.middleware");
const checkRole = require("../middleware/checkRole.middleware");
const roles = require("../constants/roles");
const Order = require("../model/order.model");
const Product = require("../model/product.model");
const User = require("../model/user.model");

const router = express.Router();

// ✅ Admin Dashboard Summary
router.get("/dashboard", auth, checkRole(roles.admin), async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    const revenueOrders = await Order.find({ status: { $ne: "cancelled" } });
    const totalRevenue = revenueOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name")
      .populate("products.productId", "title price");

    const lowStockProducts = await Product.find().limit(5); // optional

    res.status(200).json({
      message: "Admin dashboard data fetched",
      stats: {
        totalOrders,
        totalUsers,
        totalProducts,
        totalRevenue,
      },
      recentOrders,
      lowStockProducts,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard data", error: error.message });
  }
});

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

// ✅ Get single order by ID
router.get("/order/:orderId", auth, checkRole(roles.admin), async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId)
      .populate("userId", "name")
      .populate("products.productId");

    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    res.status(200).json({ message: "Order details fetched", order });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error: error.message });
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
