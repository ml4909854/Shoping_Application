const express = require("express");
const upload = require("../middleware/upload.middleware.js");
const Product = require("../model/product.model");
const auth = require("../middleware/auth.middleware.js");
const checkRole = require("../middleware/checkRole.middleware.js");
const roles = require("../constants/roles.js");
const router = express.Router();

// ✅ Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    if (!products.length) {
      return res.status(200).json({ message: "No products found!" });
    }
    res.status(200).json({ message: "Products fetched successfully!", products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products!", error: error.message });
  }
});

// ✅ Get a single product
router.get("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }
    res.status(200).json({ message: "Product details fetched.", product });
  } catch (error) {
    res.status(500).json({ message: "Error fetching product!", error: error.message });
  }
});

// ✅ Create a product (Admin only)
router.post(
  "/create",
  auth,
  checkRole(roles.admin),
  upload.single("image"),
  async (req, res) => {
    try {
      const imageUrl = req.file.path;
      const { title, brand, category, subCategory, color, description, price } = req.body;

      const newProduct = new Product({
        image: imageUrl,
        title,
        brand,
        category,
        subCategory,
        color,
        price,
        userId: req.user._id,
      });

      const savedProduct = await newProduct.save();
      res.status(201).json({ message: "Product created successfully!", product: savedProduct });
    } catch (error) {
      res.status(500).json({ message: "Product not created!", error: error.message });
    }
  }
);

// ✅ Update a product (Admin only)
router.patch(
  "/update/:id",
  auth,
  checkRole(roles.admin),
  upload.single("image"),
  async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found!" });
      }

      const imageUrl = req.file ? req.file.path : product.image;

      const updatedData = {
        ...req.body,
        image: imageUrl,
      };

      const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData, {
        new: true,
      });

      res.status(200).json({ message: "Product updated successfully!", product: updatedProduct });
    } catch (error) {
      res.status(500).json({ message: "Failed to update product!", error: error.message });
    }
  }
);

// ✅ Delete a product (Admin only)
router.delete(
  "/delete/:id",
  auth,
  checkRole(roles.admin),
  async (req, res) => {
    try {
      const productId = req.params.id;

      const product = await Product.findByIdAndDelete(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found!" });
      }

      res.status(200).json({ message: "Product deleted successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product!", error: error.message });
    }
  }
);

module.exports = router;
