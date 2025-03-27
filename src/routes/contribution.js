const express = require("express");
const { Router } = express;
const router = Router();
const Contribution = require("../models/contribution");
const { verifyToken } = require("../middleware/auth");

router.get("/:userId/:groupId", verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupId;

    console.log(`Fetching contributions for user: ${userId}, group: ${groupId}`);

    // Fetch contributions for the user and group
    const contributions = await Contribution.find({ user: userId, group: groupId })
      .populate("group")
      .populate("user");

    console.log("Contributions found:", contributions);

    res.json(contributions); // Return an empty array if no contributions are found
  } catch (error) {
    console.error("Error fetching contributions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;