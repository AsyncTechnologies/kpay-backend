const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/user");
const Transaction = require("../models/transaction");

exports.SearchFriend = async (req, res, next) => {
    const {userinput} = req.body

  try {

    const users = await User.find({
      $or: [
        {
          username: { $regex: userinput, $options: "i" },
        },
        {
          email: { $regex: userinput, $options: "i" },
        },
        {
          phone: { $regex: userinput, $options: "i" },
        },
      ],
    });

    if (users?.length > 0) {
      res.status(200).json(users);
    } else {
      res.status(401).json({
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.SendMoney = async (req, res, next) => {
  const { TransactionTo, TransactionFrom, TransactionAmount, Status,PaymentType } =
    req.body;

  try {
    const transactionAmount = parseFloat(TransactionAmount);

    const PlusToAmount = await User.findOne({ _id: TransactionTo });
    const MinusFromAmount = await User.findOne({ _id: TransactionFrom });

    if (parseFloat(MinusFromAmount.balance) <  transactionAmount) {
      res.status(400).send({ error: "Insufficient balance" });
      return;
    }

    const transaction = await Transaction.create({
      TransactionTo: TransactionTo,
      TransactionFrom: TransactionFrom,
      TransactionAmount: TransactionAmount,
      Status: Status,
      PaymentType: PaymentType
    });

    if (transaction) {
      if (!PlusToAmount || !MinusFromAmount) {
        return res.status(404).send({ error: "User not found" });
      }

      const updatedPlusBalance = parseFloat(PlusToAmount.balance) + transactionAmount;
      const updatedMinusBalance = parseFloat(MinusFromAmount.balance) - transactionAmount;

      PlusToAmount.balance = updatedPlusBalance.toString();
      MinusFromAmount.balance = updatedMinusBalance.toString();

      await PlusToAmount.save();
      await MinusFromAmount.save();

      res.status(201).json({ message: "Transaction successful", transaction });
    } else {
      res.status(404).json({ message: "Transaction Failed" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getTransaction = async (req, res, next) => {
  const id = req._id;

  try {
    const transaction = await Transaction.find({
      $or: [
        {
          TransactionTo: id,
        },
        {
          TransactionFrom: id,
        },
      ],
    })
      .populate({ path: "TransactionTo", select: "username email phone _id" })
      .populate({
        path: "TransactionFrom",
        select: "username email phone _id",
      });

    if (transaction.length > 0) {
      res.status(201).json({ message: "Transaction successful", transaction });
    } else {
      res.status(404).json({ message: "No Transaction" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
