const express = require("express");
const auth = require("../middleware/auth.middleware");
const Order = require("../model/order.model");
const Product = require("../model/product.model");
const Cart = require("../model/cart.model");

const router = express.Router();

// ✅ Route 1: Buy Now - Place Single Product Order
router.post("/buyOrderFromProduct", auth, async (req, res) => {
  const { productId, address, paymentMethod } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const totalAmount = product.price * quantity;

    const newOrder = new Order({
      userId: req.user._id,
      products: [{ productId, quantity:1 }],
      totalAmount,
      address,
      paymentMethod,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order: savedOrder });
  } catch (error) {
    res.status(500).json({ message: "Error placing order", error: error.message });
  }
});

// ✅ Route 2: Place Order From Cart (All Products in Cart)
router.post("/buyOrderFromCart", auth, async (req, res) => {
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

    const newOrder = new Order({
      userId: req.user._id,
      products: finalProducts,
      totalAmount,
      address,
      paymentMethod,
    });

    const savedOrder = await newOrder.save();

    // Clear cart after successful order
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
    const orders = await Order.find({ userId: req.user._id }).populate("products.productId");
    if(!orders && orders.length === 0){
        return res.status(404).json({message:"No orders! Please and order some product!"})
    }
    res.status(200).json({ message: "Fetched orders successfully", orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
});

// ✅ Route 4: Admin - Update Order Status
router.patch("/updateStatus/:orderId", auth, async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
});

router.delete("/delete/:orderId", auth, async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findOneAndDelete({
      _id: orderId,
      userId: req.user._id, // Make sure user is deleting their own order
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    res.status(200).json({ message: "Order deleted successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error: error.message });
  }
})
module.exports = router;
