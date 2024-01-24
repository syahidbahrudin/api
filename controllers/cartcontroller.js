const Cart = require("../models/cartModel");
const asyncHandler = require("express-async-handler");

const getCarts = asyncHandler(async (req, res) => {
  try {
    const carts = await Cart.find({});
    res.status(200).json(carts);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});
// get a single product
const getCart = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const cart = await Cart.findById(id);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// create a product
const addCart = asyncHandler(async (req, res) => {
  try {
    const cart = await Cart.create(req.body);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

const deleteCart = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const cart = await Cart.findByIdAndDelete(id);
    if (!cart) {
      res.status(404);
      throw new Error(`cannot find any product with ID ${id}`);
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

module.exports = {
  getCarts,
  getCart,
  addCart,
  deleteCart
};
