const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, require },
    email: { type: String, require },
    phone: { type: String, require },
    photo: {
      type: String,
      require,
      default:
        "https://res.cloudinary.com/oroko/image/upload/v1738214185/og5jorctnuzqifdbywel.jpg",
    },
    coverPhoto:{
      type: String,
      require,
      default:
        "https://res.cloudinary.com/oroko/image/upload/v1738214455/zqio0mxzgkqyopewbxhg.jpg",
    },
    password: { type: String, require },
    role: { type: String, required: true, enum: ["admin", "member"] },
    userType: { type: String, enum: ["basic", "pro", "enterprice"], default: "basic", require },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
