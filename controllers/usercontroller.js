const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
require("dotenv").config();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
let refreshTokens = [];

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      userName: user.userName,
      profilePicture: user.profilePicture,
      userEmail: user.userEmail,
      profilePicture: user.profileAbout,
      userCollege: user.userCollege,
      userCourse: user.userCourse,
      userPhoneNumber: user.userPhoneNumber
    },
    "mySecretKey",
    {
      expiresIn: "30s"
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      userName: user.userName,
      profilePicture: user.profilePicture,
      userEmail: user.userEmail,
      profileAbout: user.profileAbout,
      userCollege: user.userCollege,
      userCourse: user.userCourse,
      userPhoneNumber: user.userPhoneNumber
    },
    "myRefreshSecretKey"
  );
};

const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, "mySecretKey", (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid!");
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You are not authenticated!");
  }
};

const userlogin = asyncHandler(async (req, res) => {
  try {
    const reqBody = req.body;
    const { userStudID, userPass } = reqBody;
    console.log(reqBody);

    // Check if user exists
    const user = await User.findOne({ userStudID });
    if (!user) {
      return res.status(400).json({ error: "User doesn't exist" });
    }
    console.log("User exists");

    // Check if password is correct
    const validPassword = await bcryptjs.compare(userPass, user.userPass);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }
    console.log(user);

    // Create tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update user's refresh token in the database
    await User.updateOne(
      { refresh_token: refreshToken },
      { where: { _id: user._id } }
    );

    // Set refresh token as an HTTP-only cookie
    res.cookie("refreshtoken", refreshToken, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true
    });

    // Send the access token in the response
    res.json({ userStudID: user.userStudID, accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(501).json({ error: "Username or password incorrect!" });
  }
});

const refreshToken = asyncHandler(async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshtoken; // Retrieve refresh token from cookie
    if (!refreshToken)
      return res.status(401).json("You are not authenticated!");

    // Verify the refresh token
    jwt.verify(refreshToken, "myRefreshSecretKey", (err, user) => {
      if (err) {
        console.log(err);
        return res.status(403).json("Refresh token is not valid!");
      }

      // Generate new access and refresh tokens
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      // Update the refresh token in the cookie
      res.cookie("refreshtoken", newRefreshToken, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true
      });

      // Send the new tokens in the response
      res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});
const userLogout = asyncHandler(async (req, res) => {
  try {
    // Remove refresh token from the array or database (if applicable)
    refreshTokens = refreshTokens.filter((token) => token !== req.body.token);

    // Clear the refresh token cookie
    res.cookie("refreshtoken", "", {
      expires: new Date(0), // Set expiration to the past
      httpOnly: true
    });

    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});
// create a product
const createUser = asyncHandler(async (req, res) => {
  const { v4: uuidv4 } = require("uuid"); // Assuming a well-tested library
  function generateUniqueID() {
    return uuidv4();
  }
  try {
    const user = req.body;
    const {
      id = generateUniqueID(),
      profilePicture = "https://i.pinimg.com/564x/a3/e4/7c/a3e47c7483116543b6fa589269b760df.jpg",
      profileAbout = "",
      userName,
      userEmail,
      userStudID,
      userPass,
      userCollege,
      userCourse,
      userPhoneNumber
    } = user;

    const findUser = await User.findOne({ userEmail });
    const findUserByStudId = await User.findOne({ userStudID });
    console.log(findUser);
    console.log(findUserByStudId);
    if (findUser || findUserByStudId) {
      return res.status(400).json({ error: "User already exists" });
    }

    //hash userPass
    const bcryptjs = require("bcryptjs");
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(userPass, salt);

    const newUser = new User({
      id,
      profilePicture,
      profileAbout,
      userName,
      userEmail,
      userStudID,
      userPass: hashedPassword,
      userCollege,
      userCourse,
      userPhoneNumber
    });
    console.log(newUser);

    const savedUser = await newUser.save(); // Mongoose will handle duplicate email errors here

    console.log(savedUser);

    return res.json({
      message: "User created successfully",
      success: true,
      savedUser
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.userEmail) {
      // Check for duplicate email error
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    } else {
      res.status(500);
      throw new Error(error.message); // Rethrow other errors
    }
  }
});

const forgotpass = asyncHandler(async (req, res) => {
  function sendEmail({ recipient_email, OTP }) {
    return new Promise((resolve, reject) => {
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MY_EMAIL,
          pass: process.env.MY_PASSWORD
        }
      });

      const mail_configs = {
        from: process.env.MY_EMAIL,
        to: recipient_email,
        subject: "KODING 101 PASSWORD RECOVERY",
        html: `<!DOCTYPE html>
  <html lang="en" >
  <head>
    <meta charset="UTF-8">
    <title>CodePen - OTP Email Template</title>
  </head>
  <body>
  <!-- partial:index.partial.html -->
  <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Koding 101</a>
      </div>
      <p style="font-size:1.1em">Hi,</p>
      <p>Thank you for choosing Koding 101. Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
      <p style="font-size:0.9em;">Regards,<br />Koding 101</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>Koding 101 Inc</p>
        <p>1600 Amphitheatre Parkway</p>
        <p>California</p>
      </div>
    </div>
  </div>
  <!-- partial -->
  </body>
  </html>`
      };
      transporter.sendMail(mail_configs, function (error, info) {
        if (error) {
          console.log(error);
          return reject({ message: `An error has occurred` });
        }
        return resolve({ message: "Email sent successfully" });
      });
    });
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404);
      throw new Error(`cannot find any product with ID ${id}`);
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});
const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    const userCount = users.length;

    res.status(200).json({
      count: userCount,
      users: users
    });
  } catch (error) {
    console.log(error);
  }
});

const getUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
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
const editprofile = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      userName,
      userEmail,
      profileAbout,
      userCollege,
      userCourse,
      userPhoneNumber
    } = req.body;
    const profilePicture = req.file ? req.file.filename : null;
    const updateFields = {
      userName,
      profilePicture,
      userEmail,
      profileAbout,
      userCollege,
      userCourse,
      userPhoneNumber
    };

    // Update user
    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true
    });

    // Check if user was found and updated
    if (!updatedUser) {
      res.status(404);
      throw new Error(`Cannot find any user with ID ${id}`);
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500);
    res.json({ error: error.message });
  }
});

module.exports = {
  getUsers,
  getUser,
  userlogin,
  createUser,
  forgotpass,
  deleteUser,
  refreshToken,
  userLogout,
  verify,
  editprofile,
  upload
};
