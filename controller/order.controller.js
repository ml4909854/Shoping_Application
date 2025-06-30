const express = require("express");
const auth = require("../middleware/auth.middleware");
const Order = require("../model/order.model");
const Product = require("../model/product.model");
const Cart = require("../model/cart.model");

const router = express.Router();

// ✅ Route 1: Buy Now - Place Single Product Order
router.post("/fromProduct", auth, async (req, res) => {
  const { productId, quantity = 1, address, paymentMethod } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const totalAmount = product.price * quantity;

    const deliveryDays = Math.floor(Math.random() * 4) + 2;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

    const newOrder = new Order({
      userId: req.user._id,
      products: [{ productId, quantity }],
      totalAmount,
      address,
      paymentMethod,
      deliveryDate,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order: savedOrder });
  } catch (error) {
    res.status(500).json({ message: "Error placing order", error: error.message });
  }
});

// ✅ Route 2: Place Order From Cart
router.post("/fromCart", auth, async (req, res) => {
  const { address, paymentMethod } = req.body;

  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;
    const finalProducts = [];

    for (const item of cart.products) {
      const product = await Product.findById(item.productId);
      if (product) {
        totalAmount += product.price * item.quantity;
        finalProducts.push({
          productId: item.productId,
          quantity: item.quantity,
        });
      }
    }

    const deliveryDays = Math.floor(Math.random() * 4) + 2;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

    const newOrder = new Order({
      userId: req.user._id,
      products: finalProducts,
      totalAmount,
      address,
      paymentMethod,
      deliveryDate,
    });

    const savedOrder = await newOrder.save();

    cart.products = [];
    await cart.save();

    res.status(201).json({ message: "Order placed from cart", order: savedOrder });
  } catch (error) {
    res.status(500).json({ message: "Error placing order", error: error.message });
  }
});

// ✅ Route 3: Get Logged-in User's Orders
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("userId", "name")
      .populate("products.productId");

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders! Please place an order." });
    }

    res.status(200).json({ message: "Fetched orders successfully", orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
});

// ✅ Route 4: Cancel Order
router.patch("/cancel/:orderId", auth, async (req, res) => {
  const { orderId } = req.params;
  const { cancelReason } = req.body;

  try {
    const order = await Order.findOne({ _id: orderId, userId: req.user._id });

    if (!order) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    if (order.status === "delivered") {
      return res.status(400).json({ message: "Delivered orders cannot be cancelled." });
    }

    order.status = "cancelled";
    order.cancelReason = cancelReason;
    await order.save();

    res.status(200).json({ message: "Order cancelled", order });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling order", error: error.message });
  }
});

module.exports = router;
