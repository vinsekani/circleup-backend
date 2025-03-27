const mongoose = require("mongoose");
const Meeting = require("./meeting"); // Import the Meeting model
const Announcement = require("./announcement"); // Import the Announcement model

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slogan: { type: String },
    amount: { type: Number, required: true },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Member" }],
    meetings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meeting" }],
    announcements: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Announcement" },
    ],
    uid: { type: String },
    id: { type: String },
  },
  { timestamps: true }
);

// Middleware to delete related meetings and announcements when a group is deleted
groupSchema.pre("deleteMany", async function (next) {
  const groups = await this.model.find(this.getFilter()); // Get the groups being deleted
  const groupIds = groups.map((group) => group._id);

  // Delete all meetings associated with these groups
  await Meeting.deleteMany({ _id: { $in: groups.flatMap((group) => group.meetings) } });

  // Delete all announcements associated with these groups
  await Announcement.deleteMany({ _id: { $in: groups.flatMap((group) => group.announcements) } });

  next();
});

module.exports = mongoose.model("Group", groupSchema);