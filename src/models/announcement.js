const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: { type: String, require: true },
  content: { type: String, require: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true }, // Belongs to a group
},
{timestamps: true}
);

module.exports = mongoose.model("Announcement", announcementSchema)
