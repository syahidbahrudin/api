const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true
    },
    productImage: {
      type: [
        {
          url: String
        }
      ]
    },
    productName: {
      type: String,
      required: true
    },
    productPrice: {
      type: Number,
      required: true
    },
    productCat: {
      type: String,
      required: true
    },
    productCond: {
      type: String,
      required: true
    },
    productDesc: {
      type: String
    },
    meetup: {
      type: String,
      required: true
    },
    isSold: {
      type: Boolean,
      default: false
    },
    // References the Profile model
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

const Product = new mongoose.model("Product", productSchema);
module.exports = Product;
