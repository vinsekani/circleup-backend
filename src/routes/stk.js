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
const Contribution = require("../models/contribution");
const User = require("../models/user");
const Group = require("../models/group");
const Member = require("../models/member");

router.post("/stk", async (req, res) => {
  const { phone, amount, groupId, memberId } = req.body;

  console.log("STK Push Request Body:", req.body);

  try {
    if (!phone || !amount || !groupId || !memberId) {
      return res.status(400).json({ message: "Phone, amount, groupId, and memberId are required" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    console.log("Looking for member with ID:", memberId); // Debug log
    const member = await Member.findById(memberId);
    if (!member) {
      console.log("Member not found in database for ID:", memberId); // Debug log
      return res.status(404).json({ message: "Member not found" });
    }

    const contribution = new Contribution({
      user: user._id,
      group: group._id,
      amount,
      status: "Pending",
      date: new Date(),
    });
    await contribution.save();

    const token = await mpesaAccessToken();
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3);

    const shortCode = "174379";
    const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");

    const body = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: `254${phone.substring(1)}`,
      PartyB: shortCode,
      PhoneNumber: `254${phone.substring(1)}`,
      CallBackURL: "https://circleup-backend-9eaf.onrender.com/api/mpesa/callback",
      AccountReference: `Contribution-${contribution._id}`,
      TransactionDesc: "Contribution Payment",
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.access_token}`,
      },
      body: JSON.stringify(body),
    };

    const response = await fetch(url, options);
    const data = await response.json();

    console.log("M-Pesa STK Push Response:", data);

    if (data.ResponseCode === "0") {
      contribution.checkoutRequestID = data.CheckoutRequestID;
      await contribution.save();
      return res.status(200).json({
        message: "Payment initiated successfully",
        contributionId: contribution._id,
      });
    } else {
      contribution.status = "Failed";
      await contribution.save();
      return res.status(400).json({ message: "Failed to initiate payment", error: data });
    }
  } catch (error) {
    console.error("Error in STK Push:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;