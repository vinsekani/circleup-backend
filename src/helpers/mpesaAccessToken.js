const mpesaAccessToken = async () => {
  const consumerKey = "NqJd87BvynG6scHhyeG4wBWG2v3dBg4Gp4GeBQRUzay2hpDh";
  const consumerSecret =
    "FCkmNEFLbqXZxmcGp9Jg0qCrSJnK8Hb5ewprjz8oR7q6xamTV9mcWEiKGE38aqAv";

  const base64String = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );
  const url =
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
  const headers = new Headers();
  headers.set("Authorization", `Basic ${base64String}`);

  const response = await fetch(url, { headers });
  const data = await response.json();
  const token = data;
  return token;

};


module.exports = { mpesaAccessToken };
