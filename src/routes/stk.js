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
    // Validate input
    if (!phone || !amount || !groupId || !memberId) {
      return res.status(400).json({ message: "Phone, amount, groupId, and memberId are required" });
    }

    // Find the user, group, and member
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Create a pending contribution record
    const contribution = new Contribution({
      user: user._id,
      member: member._id,
      group: group._id,
      amount,
      status: "Pending",
      date: new Date(),
    });
    await contribution.save();

    // Get M-Pesa access token
    const token = await mpesaAccessToken();
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    // Generate timestamp for M-Pesa
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3);

    // Use environment variables for sensitive data in production
    const shortCode = "174379";
    const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"; // Replace with your passkey
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
      AccountReference: "CircleUp Payment",
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
      // STK Push initiated successfully
      return res.status(200).json({
        message: "Payment initiated successfully",
        contributionId: contribution._id,
      });
    } else {
      // Update contribution status to "Failed" if STK Push fails
      contribution.status = "Failed";
      await contribution.save();
      return res.status(400).json({ message: "Failed to initiate payment", error: data });
    }
  } catch (error) {
    console.error("Error in STK Push:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Callback endpoint to handle M-Pesa response
router.post("/callback", async (req, res) => {
  console.log("M-Pesa Callback Body:", req.body);

  const { Body } = req.body;
  if (!Body || !Body.stkCallback) {
    return res.status(400).json({ message: "Invalid callback data" });
  }

  const { ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

  try {
    // Find the contribution (you may need to store CheckoutRequestID in the Contribution model to match it)
    // For simplicity, we'll assume the contributionId is passed in the AccountReference or another mechanism
    // In a real app, you'd store the CheckoutRequestID when initiating the STK Push
    const contribution = await Contribution.findOne({ status: "Pending" }).sort({ createdAt: -1 }); // Temporary workaround

    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found" });
    }

    if (ResultCode === "0") {
      // Payment successful
      contribution.status = "Paid";
      contribution.date = new Date();

      // Update the member's status to "paid"
      const member = await Member.findById(contribution.member);
      if (member) {
        member.status = "paid";
        await member.save();
      }

      await contribution.save();
      console.log("Payment successful, contribution updated:", contribution);
    } else {
      // Payment failed
      contribution.status = "Failed";
      await contribution.save();
      console.log("Payment failed:", ResultDesc);
    }

    return res.status(200).json({ message: "Callback processed successfully" });
  } catch (error) {
    console.error("Error in M-Pesa callback:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;