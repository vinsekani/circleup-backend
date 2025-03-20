const express = require("express");
const { Router } = express;
const router = Router();
const { addMember, getGroupMembers } = require("../controllers/member");
const { verifyToken } = require("../middleware/auth");


router.post("/new", verifyToken, addMember);
router.get("/:groupId", verifyToken, getGroupMembers);

module.exports = router;
