require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const plaid = require("plaid");
const app = express();
const PORT = 4000;

//if (process.env.NODE_ENV !== "production") require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var plaidClient = new plaid.Client(
  "5d5edc318fd6470012c1ce04",
  "cb6e745ba01565ddd48a4a487e7cc3",
  "38f85b8a74fef429295b5e23ae6f",
  plaid.environments.sandbox
);

//PLAID_CLIENT_ID = "5d5edc318fd6470012c1ce04";
//PLAID_SECRET = "cb6e745ba01565ddd48a4a487e7cc3";
//PLAID_PUBLIC_KEY = "1338f85b8a74fef429295b5e23ae6f";
//const client = new plaid.Client(
//PLAID_CLIENT_ID,
//PLAID_SECRET,
//PLAID_PUBLIC_KEY,
//plaid.environments.sandbox,
//{ version: "2018-05-22" }
///);

//to integrate Plaid with Stripe:
// plaidClient.exchangePublicToken(["1338f85b8a74fef429295b5e23ae6f"], function(
//   err,
//   res
// ) {
//   var accessToken = res.access_token;
//   //generation of bank account token:
//   plaidClient.createStripeToken(accessToken, "acct_1FAqcLBakQYdHUio", function(
//     err,
//     res
//   ) {
//     var bankAccountToken = res.stripe_bank_account_token;
//   });
// });

// //manually obtain and verify bank accounts:
// var tokenID = request.body.stripeToken;
// //creation of customer
// stripe.customers.create(
//   {
//     source: tokenID,
//     description: "Example customer"
//   },
//   function(err, customer) {
//     res.status(200).send({ error: err });
//     console.log(customer);
//   }
// );

//microdeposit data:
// var data = { amounts: [32, 45] };
// stripe.customers.verifySource(
//   "cus_AFGbOSiITuJVDs",
//   "ba_17SHwa2eZvKYlo2CUx7nphbZ",
//   {
//     amounts: [32, 45]
//   },
//   function(err, bankAccount) {
//     // asynchronously called
//     res.status(200).send({ error: err });
//     console.log(bankAccount);
//   }
// );

//creating ACH charge:
// stripes.charges
//   .create({
//     amount: 1500,
//     currency: "cad",
//     customer: customerId
//   })
//   .then(function(charge) {
//     console.log("CHARGE BITCH. ",charge);
//   });

var PUBLIC_TOKEN = null;
var ACCESS_TOKEN = null;
var ITEM_ID = null;

app.post("/sendToken", (req, res) => {
  console.log(req.body);
  PUBLIC_TOKEN = req.body.token.public_token;
  plaidClient.exchangePublicToken(PUBLIC_TOKEN).then(exchangeResponse => {
    ACCESS_TOKEN = exchangeResponse.access_token;
    ITEM_ID = exchangeResponse.item_id;
    console.log("ACCESS_TOKEN", ACCESS_TOKEN);
    console.log("ITEM_ID", ITEM_ID);
    res.send(PUBLIC_TOKEN);

    // client.getTransactions(
    //   ACCESS_TOKEN,
    //   "2018-01-01",
    //   "2018-02-01",
    //   {
    //     count: 250,
    //     offset: 0
    //   },
    //   (err, result) => {
    //     // Handle err
    //     if (err) console.log("ERROR, ICARLY", err);
    //     const transactions = result.transactions;
    //     console.log("TRANSACTIONS, BAYBE", transactions);
    //   }
    // );
  });
});

app.get("/getUserDonations", (req, res) => {
  console.log("NEW ROUTE TRIGGERED");
  var changeArray = [];
  client.getTransactions(
    ACCESS_TOKEN,
    "2018-01-01",
    "2018-02-01",
    {
      count: 250,
      offset: 0
    },
    async (err, result) => {
      // Handle err
      if (err) console.log("ERROR, ICARLY", err);
      const transactions = result.transactions;
      console.log("TRANSACTIONS, BAYBE", transactions);
      await transactions.forEach(async transaction => {
        console.log("INDIVIDUAL TRANSACTION", transaction);
        var ogAmount = transaction.amount;
        var roundedAmount = Math.ceil(ogAmount);
        if (roundedAmount - ogAmount == 0) {
          await changeArray.push(1);
        } else {
          await changeArray.push(roundedAmount - ogAmount);
        }
      });
      var totalToCharge = await changeArray.reduce(
        (total, current) => total + current,
        0
      );
      res.send({
        totalToCharge,
        message: "THIS AMOUNT WILL BE CHARGED TO USER IMMEDIATELY"
      });
      // .then(() => {
      // var totalToCharge = changeArray.reduce(
      //   (total, current) => total + current,
      //   0
      // );
      // res.send({
      //   totalToCharge,
      //   message: "THIS AMOUNT WILL BE CHARGED TO USER"
      // });
      // });
    }
  );

  //generation of bank account token:
  // console.log("IM HERE NOW ");
  // plaidClient.createStripeToken(
  //   ACCESS_TOKEN,
  //   "acct_1FB1SXDXDwEfuvRE",
  //   (err, res) => {
  //     //handle error here
  //     if (err) console.log("ERROR", err);
  //     const bankAccountToken = res.stripe_bank_account_token;
  //     console.log("tokens galore", bankAccountToken);
  //   }
  // );
});

// app.post("/payment", (req, res) => {
//   const body = {
//     source: req.body.token.id,
//     amount: req.body.amount,
//     currency: "usd"
//   };
//   stripe.charges.create(body, (stripeErr, stripeRes) => {
//     if (stripeErr) {
//       res.status(500).send({ errror: stripeErr });
//     } else {
//       res.status(200).send({ success: stripeRes });
//     }
//   });
// });

app.listen(PORT, () => {
  console.log("listening on 4000");
});
