const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    date: {
      type: String,
      required: true,
    },
    remaining: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const recordSchema = new mongoose.Schema(
  {
    billNo: {
      type: Number,
      unique: true,
      sparse: true,
    },
    date: {
      type: String,
      required: true,
    },
    farmerName: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    crop: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    payments: [paymentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Record", recordSchema);
