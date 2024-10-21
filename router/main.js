const express = require("express");
const router = express.Router();
const user = require("../controller/user");
const isAuth = require("../middleware/isAuth");
const main = require('../controller/main')

router.post("/SearchFriend", isAuth, main.SearchFriend);
router.post("/SendMoney", isAuth, main.SendMoney);
router.get("/getTransaction", isAuth, main.getTransaction);
router.post("/UpdateRequestStatus", isAuth, main.UpdateRequestStatus);
router.post("/DepositMoney", isAuth, main.DepositMoney);

module.exports = router;
