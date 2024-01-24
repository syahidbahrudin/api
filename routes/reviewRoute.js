const express = require("express");
const router = express.Router();
const {
  getReviews,
  getReview,
  createReview
} = require("../controllers/reviewcontroller");
router.get("/product/:productId/reviews", getReviews);

router.get("/product/:productId/reviews/:id", getReview);

router.post("/product/:productId/reviews/new", createReview);

module.exports = router;
