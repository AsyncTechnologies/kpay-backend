const express = require("express");
const router = express.Router();
const user = require("../controller/user");
const isAuth = require("../middleware/isAuth");
const main = require('../controller/main')

router.put("/update-password", isAuth, user.updatePassword);
router.put("/update-personalInfo", isAuth, user.updatePersonalInfo);
router.get("/get-userDetails", isAuth, user.getUserDetails);
router.get("/getAllContactsFromDB", isAuth, user.getAllContactsFromDB);



module.exports = router;
