const express = require("express");
const bodyParser = require("body-parser");
const plaid = require("plaid");
const app = express();
const PORT = 4000;

app.use(bodyParser.json());

PLAID_CLIENT_ID = "5d5edc318fd6470012c1ce04";
PLAID_SECRET = "cb6e745ba01565ddd48a4a487e7cc3";
PLAID_PUBLIC_KEY = "1338f85b8a74fef429295b5e23ae6f";
const client = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  plaid.environments.sandbox,
  { version: "2018-05-22" }
);

var PUBLIC_TOKEN = null;
var ACCESS_TOKEN = null;
var ITEM_ID = null;

app.post("/sendToken", (req, res) => {
  console.log(req.body);
  PUBLIC_TOKEN = req.body.token.public_token;
  client.exchangePublicToken(PUBLIC_TOKEN).then(exchangeResponse => {
    ACCESS_TOKEN = exchangeResponse.access_token;
    ITEM_ID = exchangeResponse.item_id;
    console.log("ACCESS_TOKEN", ACCESS_TOKEN);
    console.log("ITEM_ID", ITEM_ID);

    client.getTransactions(
      ACCESS_TOKEN,
      "2018-01-01",
      "2018-02-01",
      {
        count: 250,
        offset: 0
      },
      (err, result) => {
        // Handle err
        if (err) console.log("ERROR, ICARLY", err);
        const transactions = result.transactions;
        console.log("TRANSACTIONS, BAYBE", transactions);
      }
    );
  });
});

app.listen(PORT, () => {
  console.log("listening on 4000");
});
