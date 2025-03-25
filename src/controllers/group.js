const Group = require("../models/group");
const User = require("../models/user");
const Member = require("../models/member"); // Import the Member model

// Create Group
const createGroup = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No valid user found" });
    }

    const { name, slogan, amount, uid, id } = req.body;
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
      amount,
      admin: adminId,
      members: [adminId],
      meetings: [],
      announcements: [],
      uid,
      id,
    });

    await newGroup.save();
    return res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error Details:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get all groups for an admin
const getGroupsByAdmin = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No valid user found" });
    }

    const adminId = req.user.id;
    const groups = await Group.find({ admin: adminId }).populate("members");

    return res.status(200).json(groups);
  } catch (error) {
    console.error("Error Details:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get group by UID
const getGroupByUid = async (req, res) => {
  try {
    const { uid } = req.params;
    const group = await Group.findOne({ uid });

    if (!group) {
      return res
        .status(404)
        .json({ message: "No group found for UID: " + uid });
    }

    return res.status(200).json({ group });
  } catch (error) {
    console.error("Error Details:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getGroupsByMember = async (req, res) => {
  try {
    // Get the phone number from the query parameter
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Find the member by phone number
    const member = await Member.findOne({ phone });
    if (!member) {
      return res
        .status(404)
        .json({ message: "Member not found with this phone number" });
    }

    // Find all groups where the member's _id is in the members array
    const groups = await Group.find({ members: member._id })
      .populate("admin", "fullName email")
      .populate("members", "fullName phone");

    if (!groups || groups.length === 0) {
      return res
        .status(404)
        .json({ message: "No groups found for this member" });
    }

    return res.status(200).json(groups);
  } catch (error) {
    console.error("Error Details:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createGroup,
  getGroupsByAdmin,
  getGroupByUid,
  getGroupsByMember,
};
