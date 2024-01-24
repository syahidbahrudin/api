const express = require("express");
const Product = require("../models/productModel");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchproduct,
  upload
} = require("../controllers/productcontroller");

router.get("/", searchproduct, getProducts);

router.get("/:id", getProduct);

router.post("/", upload.array("productImage"), createProduct);

// update a product
router.put("/:id", upload.array("productImage"), updateProduct);

// delete a product

router.delete("/:id", deleteProduct);

module.exports = router;
