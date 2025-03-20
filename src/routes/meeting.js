const express = require("express");
const { Router } = express;
const router = Router();
const { addMeeting, getGroupMeetings} = require("../controllers/meeting");
const { verifyToken } = require("../middleware/auth");


router.post("/new", verifyToken, addMeeting);
router.get("/:groupId", verifyToken, getGroupMeetings);

module.exports = router;