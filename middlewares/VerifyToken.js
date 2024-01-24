const jwt = require("jsonwebtoken");
require("dotenv").config;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Token:", token);
  const decodedToken = jwt.decode(token, { complete: true });
  console.log("Decoded Token:", decodedToken);
  if (token == null) {
    console.log("Token not provided");
    return res.status(401).json({ error: "Token not provided" });
  }

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET || "defaultSecret",
    (err, decoded) => {
      console.log(
        "Token Secret:",
        process.env.ACCESS_TOKEN_SECRET || "defaultSecret"
      );

      if (err) {
        console.log("Token verification failed:", err);
        return res.status(403).json({ error: "Token verification failed" });
      }

      req.userStudID = decoded.userStudID;
      console.log("sad", userStudID);
      next();
    }
  );
};

module.exports = { verifyToken };
