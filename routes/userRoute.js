const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  forgotpass,
  deleteUser,
  userlogin,
  refreshToken,
  userLogout,
  editprofile
} = require("../controllers/usercontroller");

const upload = multer({ storage: storage });
router.get("/", getUsers);

router.get("/:id", getUser);

router.post("/signup", createUser);
router.post("/login", userlogin);
router.post("/refresh", refreshToken);
router.post("/logout", userLogout);
// update a product
router.post("/forgotpass", forgotpass);

// delete a product
router.put("/:id", upload.single("profilePicture"), editprofile);
router.delete("/:id", deleteUser);

module.exports = router;
