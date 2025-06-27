const express = require("express");
const auth = require("../middleware/auth.middleware");
const Order = require("../model/order.model");
const Review = require("../model/review.model");

const router = express.Router();

// Add a review route product....
router.post("/add", auth, async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user._id;

  try {

    // ✅ 2. Check if product was ordered and delivered
    const order = await Order.findOne({
      userId,
      "products.productId": productId,
      status: "delivered",
    });

    if (!order) {
      return res.status(403).json({
        message: "You can only review products that were delivered.",
      });
    }

    // ✅ 1. Check if already reviewed
    const alreadyReviewed = await Review.findOne({ userId, productId });
    if (alreadyReviewed) {
      return res.status(400).json({
        message: "You have already reviewed this product.",
      });
    }

    // ✅ 3. Create Review
    const newReview = new Review({
      userId,
      productId,
      rating,
      comment,
    });

    const savedReview = await newReview.save();

    res.status(201).json({
      message: "Review submitted successfully.",
      review: savedReview,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error submitting review.",
      error: error.message,
    });
  }
});


// ✅ GET /review/product/:productId => All reviews for a product
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
    }).populate("userId", "name");

    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ message: "No reviews found." });
    }

    res.status(200).json({
      message: "Reviews fetched successfully.",
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching reviews.",
      error: error.message,
    });
  }
});

module.exports = router