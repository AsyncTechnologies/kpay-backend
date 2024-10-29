const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");

const stripeController = require('../controller/stripe')


router.post('/createCustomer', stripeController.createCustomer)
router.post('/createSetupIntent', stripeController.createSetupIntent)
router.post('/listSavedCards', stripeController.listSavedCards)
router.post('/createPaymentIntent', stripeController.createPaymentIntent)



module.exports = router;
