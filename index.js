const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const errorMiddleware = require("./middlewares/errorMiddleware");
const path = require("path");

const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const reviewRoute = require("./routes/reviewRoute");
const cartRoute = require("./routes/cartRoute");

const PORT = process.env.PORT || 2000;
const FRONTEND = process.env.FRONTEND;
app.use(cors());

var corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/carts", cartRoute);

app.get("/", (req, res) => {
  res.send("Hello NODE API");
});

//running server

app.use(errorMiddleware);

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`server is running at ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
