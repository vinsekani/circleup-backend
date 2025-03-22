const express = require("express");
const { Router } = express;
const router = Router();
const {
  addMeeting,
  getGroupMeetings,
  updateMeeting,
  deleteMeeting,
} = require("../controllers/meeting");
const { verifyToken } = require("../middleware/auth");

router.post("/new", verifyToken, addMeeting);
router.get("/:groupId", verifyToken, getGroupMeetings);
router.put("/:meetingId", verifyToken, updateMeeting);
router.delete("/:meetingId", verifyToken, deleteMeeting);

module.exports = router;
