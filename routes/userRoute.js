const express = require("express");
const router = express.Router();
// Importing controllers
const {
  register,
  login,
  changePassword,
  currentUser,
} = require("../controllers/userController");

// Routes
router.post("/register", register);
router.post("/login", login);
router.post("/change-password", changePassword);
router.get("/current-user", currentUser);

module.exports = router;
