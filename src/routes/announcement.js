const express = require("express");
const { Router } = express;
const router = Router();
const { addAnnouncement, getGroupAnnouncements, updateAnnouncement, deleteAnnouncement } = require("../controllers/announcement");
const { verifyToken } = require("../middleware/auth");

router.post("/new", verifyToken, addAnnouncement);
router.get("/:groupId", verifyToken, getGroupAnnouncements);
router.put("/:announcementId", verifyToken, updateAnnouncement);
router.delete("/:announcementId", verifyToken, deleteAnnouncement);

module.exports = router;
