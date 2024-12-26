const express = require("express");
const router = express.Router();
const authController = require("../controller/auth");

router.post("/signup", authController.signUp);
router.post("/signin", authController.signIn);
router.post("/createUser", authController.verifyOtpAndCreateUser);


module.exports = router;
