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



// const verifyToken = async (req, res, next) => {
//   try {
//     const token = req.header("Authorization")?.split(" ")[1];

//     console.log("Received Token:", token);

//     if (!token) {
//       return res.status(401).json({ message: "Unauthorized: No token provided" });
//     }

//     // Decode Token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log("Decoded Token Data:", decoded); // Debugging

//     // Find User
//     const user = await User.findById(decoded.id).select("-password");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     req.user = user;
//     console.log("Authenticated User:", req.user); // Debugging

//     next();
//   } catch (error) {
//     console.error("Token Verification Error:", error.message);
//     return res.status(403).json({ message: "Invalid or Expired Token", error: error.message });
//   }
// };




const verifyToken = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    console.log("Received Token:", token);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Decode Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token Data:", decoded); // Debugging

    // Attach decoded data to request (without fetching user from DB)
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Token Verification Error:", error.message);
    return res.status(403).json({ message: "Invalid or Expired Token", error: error.message });
  }
};

module.exports = { verifyToken };



module.exports = {authenticateUser,verifyToken};
