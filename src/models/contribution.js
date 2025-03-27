const mongoose = require("mongoose");

const contributionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true }, // Added
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" }, // Updated
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contribution", contributionSchema);