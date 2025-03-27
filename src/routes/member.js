// const express = require("express");
// const { Router } = express;
// const router = Router();
// const { addMember, getGroupMembers, editMember, deleteMember } = require("../controllers/member");
// const { verifyToken } = require("../middleware/auth");

// router.post("/new", verifyToken, addMember);
// router.get("/:groupId", verifyToken, getGroupMembers);
// router.put("/:id", verifyToken, editMember); // New route for editing a member
// router.delete("/:id", verifyToken, deleteMember); // New route for deleting a member

// module.exports = router;

const express = require("express");
const { Router } = express;
const router = Router();
const { addMember, getGroupMembers, editMember, deleteMember } = require("../controllers/member");
const { verifyToken } = require("../middleware/auth");
const Member = require("../models/member");
const User = require("../models/user");
const Group = require("../models/group");

router.post("/new", verifyToken, addMember);
router.get("/:groupId", verifyToken, getGroupMembers);
router.put("/:id", verifyToken, editMember);
router.delete("/:id", verifyToken, deleteMember);

router.get("/user/:userId/group/:groupId", verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupId;

    console.log(`Fetching member for user: ${userId}, group: ${groupId}`);

    let member = await Member.findOne({ user: userId, group: groupId });
    console.log("Member found:", member);

    if (!member) {
      const user = await User.findById(userId);
      console.log("User found:", user);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const group = await Group.findById(groupId);
      console.log("Group found:", group);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      member = new Member({
        user: userId,
        group: groupId,
        fullName: user.fullName || user.email.split("@")[0],
        phone: user.phone,
        status: "unpaid",
        startDate: new Date(),
      });

      try {
        await member.save();
        console.log("Member created:", member);

        group.members.push(member._id);
        await group.save();
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error, fetch the existing member
          member = await Member.findOne({ user: userId, group: groupId });
          console.log("Fetched existing member after duplicate error:", member);
        } else {
          throw error;
        }
      }
    }

    res.json({ member });
  } catch (error) {
    console.error("Error fetching or creating member:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;