const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    info: {
      favoriteFood: {
        type: String,
        default: "",
      },
      favoriteSport: {
        type: String,
        default: "",
      },
      favoritePlayer: {
        type: String,
        default: "",
      },
      bio: {
        type: String,
        min: 40,
        default: "",
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verficationString: {
      type: String,
    },
    passwordResetCode: {
      type: String,
    },
    googeId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
