const User = require("./../model/User");

const updateOrCreateUserFromOauth = async ({ oauthUserInfo }) => {
  const { id: googleId, verified_email: isVerified, email } = oauthUserInfo;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const result = User.findOneAndUpdate(
      { email },
      { $set: { googleId, isVerified } },
      { new: true, returnOriginal: false }
    );
    return result;
  } else {
    const user = new User({
      email,
      googleId,
      isVerified,
    });
    const result = await user.save();
    return result;
  }
};
module.exports = { updateOrCreateUserFromOauth };
