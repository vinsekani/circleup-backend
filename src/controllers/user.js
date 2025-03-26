const User = require("../models/user");
const { generateToken } = require("../helpers/generateToken");
const bcrypt = require("bcrypt");

const signUp = async (req, res) => {
  try {
    const { fullName, phone, email, password, role } = req.body;
    const user = await User.findOne({ phone });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      phone,
      email,
      password: hashedPassword,
      role,
    });

    const token = generateToken(newUser._id);
    res.cookie(token, {
      path: "/",
      httpOnly: true,
      secure: true,
      maxAge: 30 * 24 * 60 * 1000,
    });

    const savedUser = await newUser.save();
    const { password: userPassword, ...otherFields } = savedUser._doc;
    console.log(otherFields);
    return res.status(201).json({ ...otherFields, token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const { password: userPassword, ...otherFields } = user._doc;
    return res.status(200).json({ ...otherFields, token });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const update = async (req, res) => {
  try {
    console.log("PATCH /api/user/:id - Request received:", req.params, req.body);
    const { id } = req.params;
    if (!req.user || !req.user.id) {
      console.log("PATCH /api/user/:id - Unauthorized: No valid user found");
      return res
        .status(401)
        .json({ message: "Unauthorized: No valid user found" });
    }
    if (req.user.id !== id) {
      console.log("PATCH /api/user/:id - Forbidden: User ID mismatch");
      return res
        .status(403)
        .json({ message: "Forbidden: You can only update your own account" });
    }

    const updateData = { ...req.body };
    if (updateData.email && !updateData.email.includes("@")) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    if (updateData.phone && updateData.phone.length < 10) {
      return res.status(400).json({ message: "Phone number must be at least 10 digits" });
    }
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...otherFields } = updatedUser._doc;
    return res.status(200).json(otherFields);
  } catch (error) {
    console.error("Error in update:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    console.log("DELETE /api/user/:id - Request received:", req.params);
    const { id } = req.params;

    if (!req.user || !req.user.id) {
      console.log("DELETE /api/user/:id - Unauthorized: No valid user found");
      return res
        .status(401)
        .json({ message: "Unauthorized: No valid user found" });
    }

    if (req.user.id !== id) {
      console.log("DELETE /api/user/:id - Forbidden: User ID mismatch");
      return res
        .status(403)
        .json({ message: "Forbidden: You can only delete your own account" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = { signUp, login, update, deleteUser };