const mongoose = require("mongoose");

const contributionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Contribution", contributionSchema);