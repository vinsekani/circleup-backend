// const express = require("express");
// const { Router } = express;
// const router = Router();
// const { authenticateUser } = require("../middleware/auth");
// const {
//   createGroup,
//   getGroupsByAdmin,
//   getGroupByUid,
//   getGroupsByMember,
//   getGroupById,
//   updateGroup,
//   deleteGroup,
// } = require("../controllers/group");

// router.post("/new", authenticateUser, createGroup);
// router.get("/admin", authenticateUser, getGroupsByAdmin); // Updated endpoint to match frontend
// router.get("/uid/:uid", getGroupByUid);
// router.get("/member", getGroupsByMember);
// router.get("/:id", getGroupById);
// router.put("/:id", authenticateUser, updateGroup); // New route for updating a group
// router.delete("/:id", authenticateUser, deleteGroup); // New route for deleting a group

// module.exports = router;

const express = require("express");
const { Router } = express;
const router = Router();
const { authenticateUser } = require("../middleware/auth");
const {
  createGroup,
  getGroupsByAdmin,
  getGroupByUid,
  getGroupsByMember,
  getGroupById,
  updateGroup,
  deleteGroup,
} = require("../controllers/group");

router.post("/new", authenticateUser, createGroup);
router.get("/admin", authenticateUser, getGroupsByAdmin);
router.get("/uid/:uid", authenticateUser, getGroupByUid);
router.get("/member", authenticateUser, getGroupsByMember);
router.get("/:id", authenticateUser, getGroupById);
router.put("/:id", authenticateUser, updateGroup);
router.delete("/:id", authenticateUser, deleteGroup);

module.exports = router;