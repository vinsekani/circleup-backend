const express = require("express");
const { Router } = express;
const router = Router();
const {authenticateUser} = require("../middleware/auth");
const { createGroup, getGroupsByAdmin, getGroupByUid } = require("../controllers/group");

router.post("/new", authenticateUser, createGroup);
router.get("/all", getGroupsByAdmin);
router.get("/uid/:uid", getGroupByUid);
// router.get("/:id", getGroupById);

module.exports = router;