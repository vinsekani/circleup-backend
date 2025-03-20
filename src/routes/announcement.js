const express = require("express");
const { Router } = express;
const router = Router();
const { addAnnouncement, getGroupAnnouncements} = require("../controllers/announcement");
const { verifyToken } = require("../middleware/auth");


router.post("/new", verifyToken, addAnnouncement);
router.get("/:groupId", verifyToken, getGroupAnnouncements);

module.exports = router;