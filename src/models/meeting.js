const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    title:{type: String, required: true},
    time:{type: String, required: true},
    content:{type: String, require: true},
    status: { type: String, enum: ["Next", "Upcoming", "Completed"], default: "Next" },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true }, // Belongs to a group
    location:{type:String, required: true},
    date:{type:Date, required: true},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meeting", meetingSchema);