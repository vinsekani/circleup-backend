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


const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findOne({ _id: id }).populate("members");

    if (!group) {
      return res.status(404).json({ message: "No group found for Id" });
    }

    return res.status(200).json({ group });
  } catch (error) {
    console.error("Error Details:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Group
const updateGroup = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No valid user found" });
    }

    const { id } = req.params;
    const { name, slogan, amount, uid } = req.body;
    const adminId = req.user.id;

    // Find the group
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user is the admin of the group
    if (group.admin.toString() !== adminId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You are not the admin of this group" });
    }

    // Check if the new group name is already taken (if name is being updated)
    if (name && name !== group.name) {
      const existingGroup = await Group.findOne({ name, uid });
      if (existingGroup) {
        return res.status(400).json({ message: "Group name already taken" });
      }
    }

    // Update the group
    group.name = name || group.name;
    group.slogan = slogan || group.slogan;
    group.amount = amount || group.amount;
    group.uid = uid || group.uid;

    await group.save();
    return res.status(200).json(group);
  } catch (error) {
    console.error("Error in updateGroup:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Delete Group
const deleteGroup = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No valid user found" });
    }

    const { id } = req.params;
    const adminId = req.user.id;

    // Find the group
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user is the admin of the group
    if (group.admin.toString() !== adminId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You are not the admin of this group" });
    }

    // Delete the group
    await Group.deleteOne({ _id: id });
    return res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error in deleteGroup:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = { getGroupById };

module.exports = {
  createGroup,
  getGroupsByAdmin,
  getGroupByUid,
  getGroupsByMember,
  getGroupById,
  deleteGroup,
  updateGroup
};


