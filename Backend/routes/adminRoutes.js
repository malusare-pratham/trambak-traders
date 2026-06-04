const express = require("express");
const {
  forgotPassword,
  loginAdmin,
  resetPassword,
} = require("../controllers/adminController");

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
