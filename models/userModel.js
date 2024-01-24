const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true
    },
    userName: {
      type: String,
      required: [true, "Please provide a name"],
      unique: true
    },
    userEmail: {
      type: String,
      required: [true, "Please provide a email"],
      unique: true
    },
    profilePicture: {
      type: String
    },
    profileAbout: {
      type: String
    },
    userPass: {
      type: String,
      required: [true, "Please provide a password"]
    },
    userStudID: {
      type: String,
      required: [true, "Please provide a Student ID"]
    },
    userCollege: {
      type: String,
      required: [true, "Please provide a College"]
    },
    userCourse: {
      type: String,
      required: [true, "Please provide a Course"]
    },
    userPhoneNumber: {
      type: String,
      required: [true, "Please provide a Phone Number"]
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    refresh_token: {
      type: String
    },
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date
  },
  {
    timestamps: true
  }
);
const User = new mongoose.model("User", userSchema);
module.exports = User;
//ka
