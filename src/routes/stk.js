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

router.post("/stk", async (req, res) => {
  const { phone, amount, userId } = req.body;
  const group = JSON.parse(localStorage.getItem("group")); // Note: This should come from req.body or auth

  try {
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
      Amount: amount,
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

    if (data.ResponseCode === "0") {
      // Save the contribution as Paid
      const contribution = await Contribution.create({
        userId,
        group: group.name,
        amount,
        status: "Paid",
        date: getTodayDate()
      });

      // Create next day's contribution
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await Contribution.create({
        userId,
        group: group.name,
        amount,
        status: "Upcoming",
        date: `${tomorrow.getDate()}/${tomorrow.getMonth() + 1}/${tomorrow.getFullYear()}`
      });

      return res.status(200).json({ 
        success: true, 
        contribution 
      });
    }
    return res.status(400).json({ 
      success: false, 
      message: data.errorMessage 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get contribution history
router.get("/history/:userId", async (req, res) => {
  try {
    const history = await Contribution.find({ 
      userId: req.params.userId,
      status: { $in: ['Paid', 'Failed'] }
    }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching history" });
  }
});

// Get current contribution
router.get("/current/:userId", async (req, res) => {
  try {
    const contribution = await Contribution.findOne({ 
      userId: req.params.userId,
      status: "Upcoming" 
    });
    res.status(200).json(contribution || {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching current contribution" });
  }
});

function getTodayDate() {
  const today = new Date();
  return `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
}

module.exports = router;