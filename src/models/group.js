const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slogan: { type: String },
    dailyContribution: { type: Number, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Member" }],
    meetings: [{type: mongoose.Schema.Types.ObjectId, ref: "Meeting"}],
    announcements: [{type: mongoose.Schema.Types.ObjectId, ref: "Announcement"}],
    uid: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);

