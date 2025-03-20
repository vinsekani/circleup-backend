const Group = require("../models/group");

const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const groups = await Group.find({ members: userId }).populate("members");
    
    if (groups.length === 0) {
      return res.status(200).json({ message: "You do not have an active group." });
    }

    return res.status(200).json(groups);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getUserGroups };
