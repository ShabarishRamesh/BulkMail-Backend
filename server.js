const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB Connection Promise
const connectDB = () => {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(
        "mongodb+srv://Shabarish:DB%40CODE@cluster0.u4b8yzz.mongodb.net/BulkMail"
      )
      .then(() => resolve("✅ Connected to MongoDB"))
      .catch((err) => reject("❌ DB Error: " + err));
  });
};

connectDB()
  .then((msg) => console.log(msg))
  .catch((err) => console.log(err));

// Schema
const emailModel = mongoose.model(
  "emailModel",
  { user: String, pass: String },
  "userandpass"
);

// Fetch credentials from DB - Promise
const getCredentials = () => {
  return new Promise((resolve, reject) => {
    emailModel
      .findOne()
      .then((userData) => {
        if (!userData) {
          reject("No credentials found in database");
        } else {
          resolve({ email: userData.user, password: userData.pass });
        }
      })
      .catch((err) => reject("DB Fetch Error: " + err));
  });
};

// Send mail - Promise
const sendMail = (email, password, emailList, subject, message) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user:email,
        pass:password,
      },
    });

    transporter
      .sendMail({
        from: email,
        to: emailList.join(","),
        subject: subject,
        text: message,
      })
      .then(() => resolve(true))
      .catch((err) => reject("Mail Error: " + err));
  });
};

// SEND EMAIL ROUTE
app.post("/send-email", (req, res) => {
  const { emailList, subject, message } = req.body;

  getCredentials()
    .then(({ email, password }) => {
      console.log("Using Email:", email);
      return sendMail(email, password, emailList, subject, message);
    })
    .then(() => {
      res.send(true);
    })
    .catch((err) => {
      console.log(err);
      res.send(false);
    });
});

app.listen(process.env.PORT || 5000, () => {
  console.log("🔥 Server running on port 5000");
});