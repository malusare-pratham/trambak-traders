const Counter = require("../models/Counter");
const Record = require("../models/Record");

const getRecords = async (req, res, next) => {
  try {
    const records = await Record.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

const createRecord = async (req, res, next) => {
  try {
    const data = { ...req.body };

    const counter = await Counter.findOneAndUpdate(
      { id: "billNo" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    data.billNo = counter.seq;

    if (Number(data.paidAmount) > 0) {
      data.payments = [
        {
          amount: Number(data.paidAmount),
          date: data.date,
          remaining: Number(data.totalAmount) - Number(data.paidAmount),
        },
      ];
    }

    const newRecord = await Record.create(data);
    res.status(201).json(newRecord);
  } catch (error) {
    next(error);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const {
      date,
      farmerName,
      mobile,
      crop,
      quantity,
      rate,
      totalAmount,
      remainingPayment,
    } = req.body;

    const record = await Record.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    record.date = date || record.date;
    record.farmerName = farmerName || record.farmerName;
    record.mobile = mobile || record.mobile;
    record.crop = crop || record.crop;

    if (quantity !== undefined) record.quantity = Number(quantity);
    if (rate !== undefined) record.rate = Number(rate);
    if (totalAmount !== undefined) record.totalAmount = Number(totalAmount);

    if (remainingPayment && Number(remainingPayment) > 0) {
      const addedPayment = Number(remainingPayment);
      record.paidAmount = Number(record.paidAmount || 0) + addedPayment;
      const balanceAfterThisPayment = Number(record.totalAmount) - record.paidAmount;
      const today = new Date().toISOString().slice(0, 10);

      record.payments.push({
        amount: addedPayment,
        date: today,
        remaining: balanceAfterThisPayment,
      });
    }

    const updatedRecord = await record.save();
    res.json(updatedRecord);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecords,
  createRecord,
  updateRecord,
};
