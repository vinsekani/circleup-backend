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
        "https://res.cloudinary.com/oroko/image/upload/v1737614653/user_pigxco.jpg",
    },
    coverPhoto:{
      type: String,
      require,
      default:
        "https://res.cloudinary.com/oroko/image/upload/v1743060143/pro_mv5bst.png",
    },
    password: { type: String, require },
    role: { type: String, required: true, enum: ["admin", "member"] },
    userType: { type: String, enum: ["basic", "pro", "enterprice"], default: "basic", require },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
