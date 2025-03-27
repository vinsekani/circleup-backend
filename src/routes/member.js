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

// Existing routes
router.post("/new", verifyToken, addMember);
router.get("/:groupId", verifyToken, getGroupMembers);
router.put("/:id", verifyToken, editMember);
router.delete("/:id", verifyToken, deleteMember);

// New endpoint to fetch or create a member based on user and group
router.get("/user/:userId/group/:groupId", verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupId;

    // Check if a member exists for this user and group
    let member = await Member.findOne({ user: userId, group: groupId });

    if (!member) {
      // If no member exists, create one
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      member = new Member({
        user: userId,
        group: groupId,
        fullName: user.fullName || user.email.split("@")[0], // Fallback to email prefix if fullName is not available
        phone: user.phone,
        status: "unpaid",
        startDate: new Date(),
      });
      await member.save();
    }

    res.json({ member });
  } catch (error) {
    console.error("Error fetching or creating member:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;