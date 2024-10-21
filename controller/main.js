const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/user");
const Transaction = require("../models/transaction");

exports.SearchFriend = async (req, res, next) => {
  const { userinput } = req.body;

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
  const {
    TransactionTo,
    TransactionFrom,
    TransactionAmount,
    Status,
    PaymentType,
    note,
  } = req.body;

  try {
    const transactionAmount = parseFloat(TransactionAmount);

    const PlusToAmount = await User.findOne({ _id: TransactionTo });
    const MinusFromAmount = await User.findOne({ _id: TransactionFrom });

    if (parseFloat(MinusFromAmount.balance) < transactionAmount) {
      res.status(400).send({ error: "Insufficient balance" });
      return;
    }

    const transaction = await Transaction.create({
      TransactionTo: TransactionTo,
      TransactionFrom: TransactionFrom,
      TransactionAmount: TransactionAmount,
      Status: Status,
      PaymentType: PaymentType,
      note: note,
    });

    if (transaction) {
      if (!PlusToAmount || !MinusFromAmount) {
        return res.status(404).send({ error: "User not found" });
      }

      const updatedPlusBalance =
        parseFloat(PlusToAmount.balance) + transactionAmount;
      const updatedMinusBalance =
        parseFloat(MinusFromAmount.balance) - transactionAmount;

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

exports.UpdateRequestStatus = async (req, res) => {
  const {
    transactionsid,
    TransactionTo,
    TransactionFrom,
    TransactionAmount,
    PaymentType,
  } = req.body;

  try {
    const PlusAmount = await User.findOne({ _id: TransactionTo._id });
    const minusFromAmount = await User.findOne({ _id: TransactionFrom._id });

    const plustheamount =
      parseFloat(PlusAmount.balance) + parseFloat(TransactionAmount);
    const minustheamount =
      parseFloat(minusFromAmount.balance) - parseFloat(TransactionAmount);

    PlusAmount.balance = JSON.stringify(plustheamount);
    minusFromAmount.balance = JSON.stringify(minustheamount);

    await PlusAmount.save();
    await minusFromAmount.save();

    const transactionType = await Transaction.findOne({ _id: transactionsid });

    transactionType.Status = "Send";

    await transactionType.save();

    return res.status(200).send({
      message: "Transaction status updated successfully",
      transactionType,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Error updating transaction", error: error.message });
  }

  // console.log("transactionsid",transactionsid)
};

exports.DepositMoney = async (req, res) => {
  const { money } = req.body;

  const id = req._id;

  try {
    const userData = await User.findOne({ _id: id });
    const oldMoney = JSON.parse(userData.balance);
    const newMoney = JSON.parse(money);
    const PlusMoney = oldMoney + newMoney;

    userData.balance = JSON.stringify(PlusMoney);

    userData.save();

    res.status(200).send({
      message: "Successfully Deposit",
      userData,
    });
  } catch (error) {
    res.status(500).send({
      message: "internal server error",
      error: error.message,
    });
  }
};