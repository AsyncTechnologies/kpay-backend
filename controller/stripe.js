const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/user");
const Transaction = require("../models/transaction");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


//create  a custommer id
// exports.createCustomer = async (req, res) => {
//   try {
//     const { email, phone } = req.body;


//     const findUser = await User.findOne({
//       $or: [{ email: email }, { phone: phone }]
//     });


//     if (!findUser) {
//       return res.status(400).json({ error: 'User not found' });
//     }


//     if (findUser.customerId) {

//       return res.json({ customerId: findUser.customerId });
//     } else {

//       const customer = await stripe.customers.create({
//         email: email,
//       });


//       findUser.customerId = customer.id;


//       await findUser.save();

//       return res.json({ customerId: customer.id });
//     }
//   } catch (error) {
//     res.status(500).send({ error: error.message });
//   }
// };
exports.createCustomer = async (req, res) => {
  try {

    const id = req._id;


    // Find the user in the database
    const findUser = await User.findOne({
      _id: id,
    });

    if (!findUser) {
      return res.status(400).json({ error: "User not found" });
    }

    // Check if the user already has a customerId
    if (findUser.customerId) {
      return res.json({ customerId: findUser.customerId });
    }

    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      email: findUser.email,
      metadata: { userId: findUser._id.toString() }, // Optional: Add metadata for reference
    });

    // Save the customerId to the user document
    findUser.customerId = customer.id;
    await findUser.save();

    res.json({ customerId: customer.id });
  } catch (error) {
    console.error("Error creating customer:", error.message);
    res.status(500).send({ error: error.message });
  }
};


//setup the intent to save the card
// exports.createSetupIntent = async (req, res) => {
//   try {
//     const { customerId } = req.body;

//     const setupIntent = await stripe.setupIntents.create({
//       customer: customerId,
//     });

//     res.json({ clientSecret: setupIntent.client_secret });
//   } catch (error) {
//     res.status(500).send({ error: error.message });
//   }
// };
exports.createSetupIntent = async (req, res) => {
  try {
    const id = req._id;


    // Find the user in the database
    const findUser = await User.findOne({
      _id: id,
    });


    if (!findUser || !findUser.customerId) {
      return res.status(400).json({ error: "User not found or customer ID missing" });
    }

    // Create a setup intent for the user's customerId
    const setupIntent = await stripe.setupIntents.create({
      customer: findUser.customerId,
    });

    res.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error("Error creating setup intent:", error.message);
    res.status(500).send({ error: error.message });
  }
};


//get all cards from customer id
// exports.listSavedCards = async (req, res) => {
//   try {
//     const { customerId } = req.body;


//     const paymentMethods = await stripe.paymentMethods.list({
//       customer: customerId,
//       type: 'card',
//     });


//     res.json({ cards: paymentMethods.data });
//   } catch (error) {
//     console.error('Error retrieving payment methods:', error.message);
//     res.status(500).send({ error: error.message });
//   }
// };
exports.listSavedCards = async (req, res) => {
  try {

    const id = req._id
    // Find the user
    const findUser = await User.findOne({ _id: id });



    if (!findUser || !findUser.customerId) {
      return res.status(400).json({ error: "User not found or customer ID missing" });
    }

    // List payment methods for the user's customerId
    const paymentMethods = await stripe.paymentMethods.list({
      customer: findUser.customerId,
      type: "card",
    });

    res.json({ cards: paymentMethods.data });
  } catch (error) {
    console.error("Error retrieving payment methods:", error.message);
    res.status(500).send({ error: error.message });
  }
};


//pay with saved card
// exports.createPaymentIntent = async (req, res) => {
//   try {
//     const { amount ,customerId,paymentMethodId} = req.body;

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amount,
//       currency: "usd",
//       customer: customerId,
//       payment_method: paymentMethodId,
//       automatic_payment_methods: {
//         enabled: true,
//       },
//       off_session: true,
//       confirm: true,
//     });


//     res.json({ clientSecret: paymentIntent.client_secret });
//   } catch (error) {
//     res.status(500).send({ error: error.message });
//   }
// };
exports.createPaymentIntent = async (req, res) => {
  try {

    const id = req._id
    // Find the user
    
    
    const { email, amount, paymentMethodId } = req.body;
    
    // Find the user
    const findUser = await User.findOne({ _id: id });
    // const findUser = await User.findOne({ email: email });

    if (!findUser || !findUser.customerId) {
      return res.status(400).json({ error: "User not found or customer ID missing" });
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      customer: findUser.customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error.message);

    // Handle specific errors from Stripe (e.g., card declined)
    if (error.code) {
      res.status(400).send({ error: error.message });
    } else {
      res.status(500).send({ error: error.message });
    }
  }
};

