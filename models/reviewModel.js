const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true
    },
    comment: {
      type: String,
      required: true
    },
    // References the Profile model
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }
  },
  {
    timestamps: true
  }
);

const Review = new mongoose.model("Review", reviewSchema);
module.exports = Review;
