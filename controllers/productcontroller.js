const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const path = require("path");
// get all product
const getProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// get a single product
const getProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage: storage });
// create a product
const createProduct = asyncHandler(async (req, res) => {
  const { v4: uuidv4 } = require("uuid"); // Assuming a well-tested library
  function generateUniqueID() {
    return uuidv4();
  }
  try {
    const product = req.body;
    const {
      user,
      id = generateUniqueID(),
      productName,
      productPrice,
      productCat,
      productCond,
      productDesc,
      meetup
    } = product;

    console.log(req.headers);
    const productImage = req.files.map((file) => ({ url: file.filename }));
    const newProduct = new Product({
      user,
      id,
      productImage,
      productName,
      productPrice,
      productCat,
      productCond,
      productDesc,
      meetup
    });
    console.log(newProduct);

    const savedProduct = await newProduct.save(); // Mongoose will handle duplicate email errors here
    console.log(req);

    console.log(savedProduct);

    return res.json({
      message: "Product created successfully",
      success: true,
      newProduct
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Duplicate product ID" });
    } else {
      res.status(500);
      throw new Error(error.message); // Rethrow other errors
    }
  }
});

// update a product
const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body);
    // we cannot find any product in database
    if (!product) {
      res.status(404);
      throw new Error(`cannot find any product with ID ${id}`);
    }

    const updatedProduct = await Product.findById(id);
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id, req.body);
    if (!product) {
      res.status(404);
      throw new Error(`cannot find any product with ID ${id}`);
    }
    res.json({
      message: "User created successfully",
      success: true,
      savedUser
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});
const searchproduct = asyncHandler(async (req, res) => {
  try {
    const search = req.query.search || "";
    let productCat = req.query.productCat || "All";
    let sort;
    const categoryOptions = [
      "Service",
      "Electronic",
      "Fashion",
      "Furniture",
      "Sport",
      "Food"
    ];
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;

    // Declare 'sort', 'page', and 'limit'

    productCat === "All"
      ? (productCat = [...categoryOptions])
      : (productCat = req.query.productCat.split(","));
    req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);
    let sortBy = {};
    if (req.query.sort) {
      const [sortField, sortOrder] = req.query.sort.split(",");
      sortBy[sortField] = sortOrder === "desc" ? -1 : 1; // Ascending or descending
    } else {
      sortBy["productName"] = 1; // Default to ascending by product name
    }

    const products = await Product.find({
      productName: { $regex: search, $options: "i" }
    })
      .where("productCat")
      .in([...productCat])
      .sort(sortBy)
      .skip(page * limit)
      .limit(limit);

    const total = await Product.countDocuments({
      productCat: { $in: [...productCat] },
      productName: { $regex: search, $options: "i" }
    });

    const response = {
      error: false,
      total,
      limit,
      productCat: categoryOptions,
      products
    };

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: true, message: "Internal server Error" });
  }
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchproduct,
  upload
};
