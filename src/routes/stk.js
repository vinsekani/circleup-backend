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
// Assuming you have a Contribution model
const Contribution = require("../models/Contribution");

router.post("/stk", async (req, res) => {
  const { phone, amount } = req.body;

  try {
    const token = await mpesaAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    
    const body = {
      BusinessShortCode: "174379",
      Password: Buffer.from(
        "174379" + 
        "bfb279f9aa9bdbcf158e97ddf9527c7d" + // This should be stored securely
        timestamp
      ).toString("base64"),
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

    // Store pending contribution
    await Contribution.create({
      phone,
      amount,
      status: "Pending",
      transactionId: data.CheckoutRequestID,
      date: new Date()
    });

    return res.status(200).json({ success: true, checkoutRequestId: data.CheckoutRequestID });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment initiation failed" });
  }
});

// Callback endpoint
router.post("/callback", async (req, res) => {
  const { Body } = req.body;
  const { ResultCode, CheckoutRequestID } = Body.stkCallback;

  try {
    if (ResultCode === 0) {
      // Payment successful
      await Contribution.findOneAndUpdate(
        { transactionId: CheckoutRequestID },
        { status: "Paid" }
      );
    } else {
      // Payment failed
      await Contribution.findOneAndUpdate(
        { transactionId: CheckoutRequestID },
        { status: "Failed" }
      );
    }
    res.status(200).json({ message: "Callback received" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Callback processing failed" });
  }
});

module.exports = router;