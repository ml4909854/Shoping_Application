const express = require("express");
const Cart = require("../model/cart.model.js");
const auth = require("../middleware/auth.middleware.js");
const router = express.Router();

// ✅ 1. Add product to cart
router.post("/add", auth, async (req, res) => {
  const { productId } = req.body;

  try {
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      // if cart doesn't exist, create new
      cart = new Cart({
        userId: req.user._id,
        products: [{ productId, quantity: 1 }],
      });
    } else {
      // check if product already in cart
      const existingProduct = cart.products.find((p) => p.productId.toString() === productId);

      if (existingProduct) {
        existingProduct.quantity += 1; // increment quantity
      } else {
        cart.products.push({ productId, quantity: 1 }); // add new product
      }
    }
    
    

    await cart.save();
    res.status(200).json({ message: "Product added to cart", cart , totalAmount});
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
});

// ✅ 2. Get user cart
router.get("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate("products.productId");
    if (!cart) return res.status(404).json({ message: "Cart is empty" });

    let totalAmount = 0;
    cart.products.forEach(product => {
       totalAmount += product.productId.price * product.quantity
    });

    res.status(200).json({ cart  , totalAmount});
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
});

// ✅ 3. Update quantity (+ or -)
router.patch("/update", auth, async (req, res) => {
  const { productId, action } = req.body; // action: "inc" or "dec"

  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const product = cart.products.find((p) => p.productId.toString() === productId);
    if (!product) return res.status(404).json({ message: "Product not in cart" });

    if (action === "inc") product.quantity += 1;
    if (action === "dec" && product.quantity > 1) product.quantity -= 1;

    await cart.save();
    res.status(200).json({ message: "Cart updated", cart });
  } catch (error) {
    res.status(500).json({ message: "Error updating cart", error: error.message });
  }
});

// ✅ 4. Remove product from cart
router.delete("/remove/:productId", auth, async (req, res) => {
  const productId = req.params.productId;

  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter((p) => p.productId.toString() !== productId);
    await cart.save();

    res.status(200).json({ message: "Product removed from cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Error removing product", error: error.message });
  }
});

module.exports = router;
