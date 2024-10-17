const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    TransactionTo:{
        ref : "User",
        type: mongoose.Schema.ObjectId
    },
    TransactionFrom:{
        ref : "User",
        type: mongoose.Schema.ObjectId
    },
    TransactionAmount:{
        type: String,
    },
    Status:{
        type: String,
    },
    PaymentType:{
        type: String,
    }

},{
    timestamps: true
});

const Transaction = mongoose.model("transaction", transactionSchema);
module.exports = Transaction;
