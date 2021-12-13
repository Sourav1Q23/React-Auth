const mongoose = require("mongoose");
const express = require("express");
const User = require("./../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const router = express.Router();
const { v4: uuid } = require("uuid");
const { sendEmail } = require("./../utility/sendEmail");

router.post("/signup", async (req, res, next) => {
  console.log("signup");
  const { email, password } = req.body;
  const user = await User.findOne({
    email: email,
  });

  if (user) {
    return res.sendStatus(409);
  }
  const verficationString = uuid();
  console.log(verficationString);
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(hashedPassword);

  let newUser = new User({
    email: email,
    password: hashedPassword,
    verficationString,
  });
  newUser = await newUser.save();
  try {
    await sendEmail({
      to: email,
      from: "golamkibriashourav@gmail.com",
      subject: "Please verify your email",
      text: `
            Thanks for signing up! To verify your email, click here:
            http://localhost:3000/verify-email/${verficationString}
        `,
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }

  jwt.sign(
    {
      id: newUser._id,
      email: newUser.email,
      info: newUser.info,
      isVerified: newUser.isVerified,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2d",
    },
    (err, token) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).json({
        token: token,
      });
    }
  );
});

router.post("/login", async (req, res) => {
  console.log("login");
  const { email, password } = req.body;

  const user = await User.findOne({
    email: email,
  });

  if (!user) return res.sendStatus(401);

  const { _id: id, isVerified, password: hashedPassword, info } = user;

  const validPassword = await bcrypt.compare(password, hashedPassword);

  if (validPassword) {
    jwt.sign(
      { id, isVerified, email, info },
      process.env.JWT_SECRET,
      { expiresIn: "2d" },
      (err, token) => {
        if (err) {
          res.status(500).json(err);
        }

        res.status(200).json({ token });
      }
    );
  } else {
    res.sendStatus(401);
  }
});

router.put("users/:userId", async (req, res) => {
  console.log("update info");
  const { authorization } = req.headers;
  const { userId } = req.params;

  const updates = (({ favoriteFood, favoritePlayer, favoriteSport, bio }) => ({
    favoriteFood,
    favoriteSport,
    favoritePlayer,
    bio,
  }))(req.body);

  if (!authorization) {
    return res.status(401).json({ message: "No authorization header sent" });
  }

  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unable to verify token" });

    console.log(decoded);
    const { id, isVerified } = decoded;

    if (id !== userId)
      return res.status(403).json({
        message: "Not allowed to update that user's data",
      });
    if (!isVerified)
      return res.status(403).json({
        message:
          "You need to verify your email before you can update your data",
      });

    const result = await User.findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: { info: updates } },
      { returnOriginal: false }
    );
    const { email, info } = result;

    jwt.sign(
      { id, email, isVerified, info },
      process.env.JWT_SECRET,
      { expiresIn: "2d" },
      (err, token) => {
        if (err) {
          return res.status(200).json(err);
        }
        res.status(200).json({ token });
      }
    );
  });
});

router.put("/verify-email", async (req, res) => {
  console.log("verify email");
  const { verficationString } = req.body;
  console.log(verficationString);
  const user = await User.findOne({
    verficationString,
  });

  if (!user)
    return res.status(401).json({
      message: "The email verification code is incorrect",
    });

  const { _id: id, email, info } = user;

  await User.updateOne(
    { _id: ObjectId(id) },
    {
      $set: { isVerified: true },
    }
  );

  jwt.sign(
    { id, email, isVerified: true, info },
    process.env.JWT_SECRET,
    { expiresIn: "2d" },
    (err, token) => {
      if (err) return res.sendStatus(500);
      res.status(200).json({ token });
    }
  );
});

router.put("/forgot-password/:email", async (req, res) => {
  console.log("forgot password");
  const { email } = req.params;

  const passwordResetCode = uuid();

  let user = await User.findOne({ email }); //{ $set: { passwordResetCode }}

  if (!user) {
    return res.Status(500).json({
      message: "Invalid Credential",
    });
  }
  user = await User.updateOne(
    { _id: ObjectId(user._id) },
    {
      $set: { passwordResetCode },
    }
  );

  console.log(user.nModified);
  try {
    await sendEmail({
      to: email,
      from: "golamkibriashourav@gmail.com",
      subject: "Password Reset",
      text: `
                  To reset your password, click this link:
                  http://localhost:3000/reset-password/${passwordResetCode}
              `,
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }

  res.sendStatus(200);
});

router.put("/users/:passwordResetCode/reset-password", async (req, res) => {
  console.log("reset Password");
  const { passwordResetCode } = req.params;
  const { newPassword } = req.body;

  try {
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    const result = await User.findOneAndUpdate(
      { passwordResetCode },
      {
        $set: { password: newPasswordHash },
        $unset: { passwordResetCode: "" },
      },
      {
        new: true,
      }
    );
    console.log(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "internal Server Error",
    });
  }
  res.sendStatus(200);
});

module.exports = router;
