// const express = require("express");
// const { Router } = express;
// const router = Router();
// const {mpesaAccessToken} = require("../helpers/mpesaAccessToken");

// router.post("/stk", async (req, res) => {

//   const {phone, amount} = req.body;

//   console.log(req.body)

//   try {
//     const token = await mpesaAccessToken();
//     const url =
//       "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
//     const body = {
//       BusinessShortCode: "174379",
//       Password:
//         "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMTYwMjE2MTY1NjI3",
//       Timestamp: "20160216165627",
//       TransactionType: "CustomerPayBillOnline",
//       Amount: `${amount}`,
//       PartyA: `254${phone.substring(1)}`,
//       PartyB: "174379",
//       PhoneNumber: `254${phone.substring(1)}`,
//       CallBackURL: "https://circleup-backend-9eaf.onrender.com/api/mpesa/stk",
//       AccountReference: "Test",
//       TransactionDesc: "Test",
//     };
//     const options = {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token.access_token}`,
//       },
//       body: JSON.stringify(body),
//     };

//     const response = await fetch(url,options);
//     const data = await response.json();
    
//     console.log(data)
//     return res.status(200).json(req.body)
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ message: error });
//   }
// });

// module.exports = router;


const express = require("express");
const { Router } = express;
const router = Router();
const { mpesaAccessToken } = require("../helpers/mpesaAccessToken");
const Contribution = require("../models/Contribution");
const Group = require("../models/group");
const Member = require("../models/member");
const { verifyToken } = require("../middleware/auth");

router.post("/stk", verifyToken, async (req, res) => {
  const { phone, userId } = req.body;

  if (!phone || !userId) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // Find the member by userId (memberId) and phone
    const member = await Member.findOne({ _id: userId, phone });
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found or credentials mismatch" });
    }

    // Get the group details
    const group = await Group.findById(member.group);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    const token = await mpesaAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = Buffer.from(
      "174379" + "bfb279f9aa9bdbcf158e97ddf9527c7d" + timestamp
    ).toString("base64");

    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    const body = {
      BusinessShortCode: "174379",
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: group.amount,
      PartyA: `254${phone.substring(1)}`,
      PartyB: "174379",
      PhoneNumber: `254${phone.substring(1)}`,
      CallBackURL: "https://circleup-backend-9eaf.onrender.com/api/mpesa/callback",
      AccountReference: "Contribution",
      TransactionDesc: "Daily Contribution",
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.access_token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    console.log("M-Pesa Response:", data);

    if (data.ResponseCode === "0") {
      const todayDate = getTodayDate();
      const contribution = await Contribution.create({
        userId, // Store memberId here
        group: group.name,
        amount: group.amount,
        status: "Paid",
        date: todayDate
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDate = `${tomorrow.getDate()}/${tomorrow.getMonth() + 1}/${tomorrow.getFullYear()}`;
      await Contribution.create({
        userId, // Store memberId here
        group: group.name,
        amount: group.amount,
        status: "Upcoming",
        date: tomorrowDate
      });

      return res.status(200).json({ success: true, contribution });
    }
    return res.status(400).json({ success: false, message: data.errorMessage || "Payment initiation failed" });
  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/history/:userId", verifyToken, async (req, res) => {
  try {
    const history = await Contribution.find({ 
      userId: req.params.userId,
      status: { $in: ['Paid', 'Failed'] }
    }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    console.error("History Fetch Error:", error);
    res.status(500).json({ message: "Error fetching history" });
  }
});

router.get("/current/:userId", verifyToken, async (req, res) => {
  try {
    console.log("User from token:", req.user); // Debug log
    const userId = req.params.userId;

    let member = await Member.findOne({ _id: userId });
    if (!member && req.user.phone) {
      member = await Member.findOne({ phone: req.user.phone });
    }
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const group = await Group.findById(member.group);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    let contribution = await Contribution.findOne({ 
      userId,
      status: "Upcoming" 
    });

    if (!contribution) {
      const today = new Date();
      const date = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
      contribution = await Contribution.create({
        userId,
        group: group.name,
        amount: group.amount,
        status: "Upcoming",
        date
      });
    }
    res.status(200).json(contribution);
  } catch (error) {
    console.error("Current Fetch Error:", error);
    res.status(500).json({ message: "Error fetching current contribution", error: error.message });
  }
});

router.post("/callback", async (req, res) => {
  console.log("Callback received:", req.body);
  res.status(200).json({ message: "Callback received" });
});

function getTodayDate() {
  const today = new Date();
  return `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
}

module.exports = router;