const express = require("express");
const { Router } = express;
const router = Router();
const { signUp, update, login, deleteUser } = require("../controllers/user");
const { authenticateUser } = require("../middleware/auth");
const multer = require("multer");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.post("/register", signUp);
router.post("/login", login);
router.patch(
  "/:id",
  authenticateUser,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
  ]),
  update
);
router.delete("/:id", authenticateUser, deleteUser);

module.exports = router;