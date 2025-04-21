let JwtStrategy = require("passport-jwt").Strategy; // JwtStrategy is used to verify the JWT
let ExtractJwt = require("passport-jwt").ExtractJwt; // ExtractJwt is used to extract the JWT from the request
const User = require("../models").User;
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (_id, done) => {
  let foundUser = await User.findOne({ _id }).exec();
  done(null, foundUser);
});

module.exports = (passport) => {
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
  opts.secretOrKey = process.env.PASSWORD_SECRET;

  passport.use(
    new JwtStrategy(opts, async function (jwt_payload, done) {
      try {
        let foundUser = await User.findOne({ _id: jwt_payload._id }).exec();
        if (foundUser) {
          return done(null, foundUser);
        } else {
          return done(null, false);
        }
      } catch (e) {
        return done(e, false);
      }
    })
  );

  // Google 策略
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/user/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // 檢查用戶是否已存在
          let user = await User.findOne({
            $or: [{ email: profile.emails[0].value }, { googleId: profile.id }],
          });

          if (user) {
            console.log("使用者已存在");
            // 如果用戶存在但沒有 googleId，更新它
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          // 創建新用戶（不設置密碼和角色）
          console.log("創建新用戶");
          user = new User({
            username: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            // role 初始為 null，等待用戶選擇
            role: null,
            introduction: "",
          });

          await user.save();
          console.log("新用戶已創建");
          return done(null, user);
        } catch (err) {
          console.error("Google strategy error:", err);
          return done(err, null);
        }
      }
    )
  );
};
