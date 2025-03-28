const mongoose = require("mongoose");

const contributionSchema = new mongoose.Schema({
  phone: String,
  amount: Number,
  status: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending"
  },
  transactionId: String,
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Contribution", contributionSchema);