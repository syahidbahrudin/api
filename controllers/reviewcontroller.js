const Review = require("../models/reviewModel");
const asyncHandler = require("express-async-handler");

const getReviews = asyncHandler(async (req, res) => {
  try {
    const Reviews = await Review.find({});
    res.status(200).json(Reviews);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});
// get a single product
const getReview = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    res.status(200).json(review);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// create a product
const createReview = asyncHandler(async (req, res) => {
  const { v4: uuidv4 } = require("uuid"); // Assuming a well-tested library
  function generateUniqueID() {
    return uuidv4();
  }
  try {
    const review = req.body;
    const { id = generateUniqueID(), product, comment, rating } = review;

    console.log(req.body);

    const newReview = new Review({
      id,
      product,
      comment,
      rating
    });
    console.log(newReview);

    const savedReview = await newReview.save(); // Mongoose will handle duplicate email errors here

    console.log(savedReview);

    return res.json({
      message: "Review created successfully",
      success: true,
      newReview
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "failed" });
    } else {
      res.status(500);
      throw new Error(error.message); // Rethrow other errors
    }
  }
});

module.exports = {
  getReview,
  getReviews,
  createReview
};
