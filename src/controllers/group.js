const Group = require("../models/group");
const User = require("../models/user");

// Create Group
const createGroup = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: No valid user found" });
    }

    const { name, slogan, dailyContribution, uid } = req.body;
    const adminId = req.user.id;

    // Check if group name already exists
    const existingGroup = await Group.findOne({ name, uid });
    if (existingGroup) {
      return res.status(400).json({ message: "Group name already taken" });
    }

    // Create and save group
    const newGroup = new Group({
      name,
      slogan,
      dailyContribution,
      admin: adminId,
      members: [adminId],
      meetings: [],
      announcements: [],
      uid,
    });

    await newGroup.save();
    return res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error Details:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get all groups for an admin
const getGroupsByAdmin = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: No valid user found" });
    }

    const adminId = req.user.id;
    const groups = await Group.find({ admin: adminId }).populate("members");

    return res.status(200).json(groups);
  } catch (error) {
    console.error("Error Details:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = { createGroup, getGroupsByAdmin };
