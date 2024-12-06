const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");

const stripeController = require('../controller/stripe')


router.post('/createCustomer',isAuth, stripeController.createCustomer)
router.post('/createSetupIntent',isAuth, stripeController.createSetupIntent)
router.post('/listSavedCards',isAuth, stripeController.listSavedCards)
router.post('/createPaymentIntent',isAuth, stripeController.createPaymentIntent)



module.exports = router;
