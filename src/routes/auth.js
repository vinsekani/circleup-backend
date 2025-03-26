const express = require("express");
const { Router } = express;
const router = Router();
const { signUp, update, login, deleteUser } = require("../controllers/user");
const { authenticateUser } = require("../middleware/auth");

router.post("/register", signUp);
router.post("/login", login);
router.patch("/:id", authenticateUser, update);
router.delete("/:id", authenticateUser, deleteUser);

module.exports = router;