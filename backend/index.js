const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const authRoute = require("./route/authRoute");
const { getGoogleOauthUrl } = require("./utility/getGoogleOauthUrl");
const { getGoogleUser } = require("./utility/getGoogleUser");
const {
  updateOrCreateUserFromOauth,
} = require("./utility/updateOrCreateUserFromOauth");
dotenv.config();

const app = express();

//Database Connection
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
);

//middleware
app.use(express.json());
app.use(morgan("dev"));

//Mounting Route
app.use("/api/auth", authRoute);
app.get("/auth/google/url", (req, res) => {
  const url = getGoogleOauthUrl();
  res.status(200).json({
    url,
  });
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;

  const oauthUserInfo = await getGoogleUser({ code });
  const updatedUser = await updateOrCreateUserFromOauth({ oauthUserInfo });
  const { _id: id, isVerified, email, info } = updatedUser;

  jwt.sign(
    { id, isVerified, email, info },
    process.env.JWT_SECRET,
    (err, token) => {
      if (err) {
        return res.sendStatus(500);
      }
      res.redirect(`http://localhost:3000/login?token=${token}`);
    }
  );
});

app.listen(process.env.PORT, () => {
  console.log(`Backend server is running on ${process.env.PORT}`);
});
