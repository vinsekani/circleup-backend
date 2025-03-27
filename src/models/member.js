// const mongoose = require("mongoose");


// const memberSchema = new mongoose.Schema(
//   {
//     fullName: { type: String, required: true },
//     phone: { type: String, required: true, unique: true },
//     group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
//     status: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
//     startDate: { type: Date, required: true },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Member", memberSchema);


const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    status: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
    startDate: { type: Date, required: true },
  },
  { timestamps: true }
);

memberSchema.index({ user: 1, group: 1 }, { unique: true });

module.exports = mongoose.model("Member", memberSchema);