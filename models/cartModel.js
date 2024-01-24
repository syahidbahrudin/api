const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    // References the Product model
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);
const Cart = new mongoose.model("Cart", cartSchema);
module.exports = Cart;
