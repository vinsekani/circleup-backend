const Member = require("../models/member");
const Group = require("../models/group");

// Add Member to Group
const addMember = async (req, res) => {
  try {
    const { fullName, phone, groupId, startDate } = req.body;

    // Validate input
    if (!fullName || !phone || !groupId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const existingMember = await Member.findOne({ phone, group: groupId });
    if (existingMember) {
      return res.status(400).json({ message: "Member already exists" });
    }

    const newMember = new Member({
      fullName,
      phone,
      group: groupId,
      status: "unpaid",
      startDate,
    });
    await newMember.save();

    group.members.push(newMember._id);
    await group.save();

    return res
      .status(201)
      .json({ message: "Member added successfully", newMember });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get all members in a group
const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const members = await Member.find({ group: groupId });
    return res.status(200).json(members);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { addMember, getGroupMembers };
