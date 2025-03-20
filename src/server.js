const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const stkRoute = require("./routes/stk");
const groupRoutes = require("./routes/group");
const memberRoutes = require("./routes/member")
const meetingRoutes = require("./routes/meeting")
const announcementRoutes = require("./routes/announcement")

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;


// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173", // Explicitly allow frontend origin
    credentials: true, // Allow cookies & auth headers
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/member", memberRoutes)
app.use("/api/meeting", meetingRoutes)
app.use("/api/announcement", announcementRoutes)
app.use("/api/mpesa", stkRoute);

app.get("/", (req, res) => {
  res.json({ message: "circleup, Streamline your contacts with sekani only" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Server is running on http://localhost:${PORT} and DB is connected`
      );
    });
  })
  .catch((err) => console.log(err));


  // ✅ FIXED CORS ISSUE
// app.use(
//   cors({
//     origin: "http://localhost:5173", // ✅ Explicitly allow frontend origin
//     credentials: true, // ✅ Allow cookies & auth headers
//   })
// );