const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/user");
const Transaction = require("../models/transaction");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


//create  a custommer id
exports.createCustomer = async (req, res) => {
  try {
    const { email, phone } = req.body;


    const findUser = await User.findOne({
      $or: [{ email: email }, { phone: phone }]
    });


    if (!findUser) {
      return res.status(400).json({ error: 'User not found' });
    }


    if (findUser.customerId) {

      return res.json({ customerId: findUser.customerId });
    } else {

      const customer = await stripe.customers.create({
        email: email,
      });


      findUser.customerId = customer.id;


      await findUser.save();

      return res.json({ customerId: customer.id });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

//setup the intent to save the card
exports.createSetupIntent = async (req, res) => {
  try {
    const { customerId } = req.body;

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
    });

    res.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

//get all cards from customer id
exports.listSavedCards = async (req, res) => {
  try {
    const { customerId } = req.body;


    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });


    res.json({ cards: paymentMethods.data });
  } catch (error) {
    console.error('Error retrieving payment methods:', error.message);
    res.status(500).send({ error: error.message });
  }
};

//pay with saved card
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount ,customerId,paymentMethodId} = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      customer: customerId,
      payment_method: paymentMethodId,
      automatic_payment_methods: {
        enabled: true,
      },
      off_session: true,
      confirm: true,
    });


    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
