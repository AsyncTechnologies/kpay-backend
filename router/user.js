const express = require("express");
const router = express.Router();
const user = require("../controller/user");
const isAuth = require("../middleware/isAuth");

router.put("/update-password", isAuth, user.updatePassword);
router.put("/update-personalInfo", isAuth, user.updatePersonalInfo);
router.get("/get-userDetails", isAuth, user.getUserDetails);

module.exports = router;
