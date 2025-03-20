const Announcement = require("../models/announcement");
const Group = require("../models/group");

// Add New Announcement
const addAnnouncement = async (req, res) => {
  try {
    const { title, content, groupId } = req.body;

    //Validate input
    if (!title || !content || !groupId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const newAnnouncement = new Announcement({
      title,
      content,
      group: groupId,
    });
    await newAnnouncement.save();

    group.announcement.push(newAnnouncement._id);
    await group.save();

    return res
      .status(201)
      .json({ message: "Annoucement sent successfully", newAnnouncement });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get all members in a group
const getGroupAnnouncements = async (req, res) => {
  try {
    const { groupId } = req.params;
    const announcements = await Announcement.find({ group: groupId });
    return res.status(200).json(announcements);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = { addAnnouncement, getGroupAnnouncements };