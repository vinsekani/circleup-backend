const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    console.log("Authorization Header:", authHeader); // Check if token is received

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1]; // Extract the token
    console.log("Extracted Token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    console.error("Token Verification Error:", error.message);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    console.log("Received Token:", token); // Debugging

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    console.log("Decoded User:", req.user); // Debugging

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or Expired Token" });
  }
};


module.exports = {authenticateUser,verifyToken};
