const express = require("express");
const Cart = require("../models/cartModel");
const router = express.Router();
const {
  getCart,
  getCarts,
  deleteCart
} = require("../controllers/cartcontroller");

router.get("/", getCarts);
router.get("/:id", getCart);

router.delete("/:id", deleteCart);

module.exports = router;
