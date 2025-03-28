const express = require("express");
const { Router } = express;
const router = Router();
const Contribution = require("../models/Contribution");
const User = require("../models/user");
const Group = require("../models/group");
const { verifyToken } = require("../middleware/auth");

router.get("/:userId/:groupId", verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupId;

    console.log(`Fetching contributions for user: ${userId}, group: ${groupId}`);

    // Validate user and group existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const contributions = await Contribution.find({ user: userId, group: groupId })
      .populate("group")
      .populate("user");

    console.log("Contributions found:", contributions);

    res.json(contributions);
  } catch (error) {
    console.error("Error fetching contributions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;