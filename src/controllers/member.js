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

// Edit a member
const editMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, startDate } = req.body;

    // Validate input
    if (!fullName || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Check if the updated phone number already exists in the same group (excluding the current member)
    const existingMember = await Member.findOne({
      phone,
      group: member.group,
      _id: { $ne: id },
    });
    if (existingMember) {
      return res.status(400).json({ message: "Phone number already exists in this group" });
    }

    // Update member fields
    member.fullName = fullName;
    member.phone = phone;
    member.startDate = startDate;
    await member.save();

    return res.status(200).json({ message: "Member updated successfully", member });
  } catch (error) {
    console.error("Error in editMember:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a member
const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Remove the member from the group's members array
    const group = await Group.findById(member.group);
    if (group) {
      group.members = group.members.filter(
        (memberId) => memberId.toString() !== id
      );
      await group.save();
    }

    // Delete the member
    await Member.findByIdAndDelete(id);

    return res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMember:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { addMember, getGroupMembers, editMember, deleteMember };