const express = require("express");
const { Router } = express;
const router = Router();
const {mpesaAccessToken} = require("../helpers/mpesaAccessToken");

router.post("/stk", async (req, res) => {

  const {phone, amount} = req.body;

  console.log(req.body)

  try {
    const token = await mpesaAccessToken();
    const url =
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    const body = {
      BusinessShortCode: "174379",
      Password:
        "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMTYwMjE2MTY1NjI3",
      Timestamp: "20160216165627",
      TransactionType: "CustomerPayBillOnline",
      Amount: `${amount}`,
      PartyA: `254${phone.substring(1)}`,
      PartyB: "174379",
      PhoneNumber: `254${phone.substring(1)}`,
      CallBackURL: "https://circleup-backend-9eaf.onrender.com/api/mpesa/stk",
      AccountReference: "Test",
      TransactionDesc: "Test",
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.access_token}`,
      },
      body: JSON.stringify(body),
    };

    const response = await fetch(url,options);
    const data = await response.json();
    
    console.log(data)
    return res.status(200).json(req.body)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error });
  }
});

module.exports = router;
