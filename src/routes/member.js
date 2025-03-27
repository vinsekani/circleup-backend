const express = require("express");
const { Router } = express;
const router = Router();
const { addMember, getGroupMembers, editMember, deleteMember } = require("../controllers/member");
const { verifyToken } = require("../middleware/auth");

router.post("/new", verifyToken, addMember);
router.get("/:groupId", verifyToken, getGroupMembers);
router.put("/:id", verifyToken, editMember); // New route for editing a member
router.delete("/:id", verifyToken, deleteMember); // New route for deleting a member

module.exports = router;