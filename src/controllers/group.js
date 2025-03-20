const Group = require("../models/group");
const User = require("../models/user");

// Create Group
const createGroup = async (req, res) => {
  try {
    const { name, slogan, dailyContribution } = req.body;
    const adminId = req.user.id;

    // Check if group name already exists
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({ message: "Group name already taken" });
    }

    // Create and save group
    const newGroup = new Group({
      name,
      slogan,
      dailyContribution,
      admin: adminId,
      members: [],
      mettings:[],
      announcements:[],
    });

    await newGroup.save();
    return res.status(201).json(newGroup);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all groups for an admin
const getGroupsByAdmin = async (req, res) => {
  try {
    const adminId = req.user.id; // Ensure user is authenticated
    const groups = await Group.find({ admin: adminId }).populate("members");
    return res.status(200).json(groups);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { createGroup, getGroupsByAdmin };
