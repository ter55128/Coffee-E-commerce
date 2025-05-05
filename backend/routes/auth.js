const router = require("express").Router();
const {
  registerValidation,
  loginValidation,
  beanValidation,
} = require("../validation");
const User = require("../models").User;
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { sendResetPasswordEmail } = require("../config/mailer");

router.use((req, res, next) => {
  console.log("Receiving auth request");
  next();
});

router.get("/testAPI", (req, res) => {
  return res.send("Auth route connected successfully!");
});

// get all members
router.get("/", async (req, res) => {
  try {
    let userfound = await User.find({})
      .populate("role", ["username", "email", "createdAt"])
      .exec();
    return res.status(200).send(userfound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//delete member
router.delete("/:id", async (req, res) => {
  try {
    let userfound = await User.findByIdAndDelete(req.params.id);
    return res.status(200).send("User deleted successfully");
  } catch (e) {
    return res.status(500).send(e);
  }
});

// Register
router.post("/register", async (req, res) => {
  // confirm the validation
  let { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // confirm the email is not already in the database
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("信箱已註冊，請重新登入");

  // create a new user
  let { email, username, password, role, introduction } = req.body;
  let newUser = new User({ email, username, password, role, introduction });
  try {
    let savedUser = await newUser.save();
    return res.status(200).send({
      msg: "User created successfully",
      savedUser,
    });
  } catch (e) {
    return res.status(400).send("Error: " + e);
  }
});

// Login
router.post("/login", async (req, res) => {
  // confirm the validation
  console.log(req.user);
  let { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // confirm the email is in the database
  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) return res.status(401).send("User not found");

  // confirm the password is correct
  foundUser.comparePassword(req.body.password, (err, isMatch) => {
    if (err) return res.status(500).send(err);

    if (isMatch) {
      // create and assign a token
      const tokenObject = {
        _id: foundUser._id,
        email: foundUser.email,
        role: foundUser.role,
      };
      const token = jwt.sign(tokenObject, process.env.PASSWORD_SECRET);

      return res.status(200).send({
        msg: "Login successful",
        token: "JWT " + token, // Space in "JWT " is necessary
        user: foundUser,
      });
    } else {
      return res.status(401).send("Invalid password");
    }
  });
});

router.patch(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { username, currentPassword, newPassword, introduction } = req.body;
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).send("用戶不存在");
      }

      // 如果要更改密碼，驗證當前密碼
      if (newPassword) {
        const isMatch = await new Promise((resolve, reject) => {
          user.comparePassword(currentPassword, (err, match) => {
            if (err) reject(err);
            resolve(match);
          });
        });

        if (!isMatch) {
          return res.status(401).send("當前密碼不正確");
        }
      }

      // 更新用戶資料
      if (username) user.username = username;
      if (newPassword) user.password = newPassword;
      if (introduction !== undefined) user.introduction = introduction;

      await user.save();

      // 生成新的 JWT token
      const tokenObject = {
        _id: user._id,
        email: user.email,
        role: user.role,
      };
      const token = jwt.sign(tokenObject, process.env.PASSWORD_SECRET);

      return res.status(200).send({
        msg: "個人資料更新成功",
        token: "JWT " + token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          introduction: user.introduction,
          password: user.password ? true : false,
        },
      });
    } catch (e) {
      console.error("更新個人資料時發生錯誤:", e);
      return res.status(500).send("伺服器錯誤，請稍後再試");
    }
  }
);

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("接收到重設密碼請求，email:", email);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send("找不到該電子郵件地址");
    }

    // 生成重設密碼的 token（1小時有效）
    const resetToken = jwt.sign(
      { _id: user._id },
      process.env.PASSWORD_SECRET,
      { expiresIn: "1h" }
    );
    // 發送重設密碼郵件
    try {
      const emailSent = await sendResetPasswordEmail(email, resetToken);
      console.log("郵件發送結果:", emailSent);
      if (emailSent) {
        res.status(200).send("重設密碼連結已發送到您的信箱");
      } else {
        res.status(500).send("發送重設密碼郵件失敗");
      }
    } catch (error) {
      console.error("郵件發送失敗:", error);
      return res.status(500).send("發送重設密碼郵件失敗");
    }
  } catch (error) {
    console.error("忘記密碼處理失敗:", error);
    res.status(500).send("處理重設密碼請求時發生錯誤");
  }
});

// 添加重設密碼的路由
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    //驗證 token
    const decoded = jwt.verify(token, process.env.PASSWORD_SECRET);
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(400).send("重設密碼連結無效或已過期");
    }
    user.password = newPassword;
    await user.save();

    res.status(200).send("密碼已成功重設");
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).send("重設密碼連結已過期");
    }
    res.status(500).send("重設密碼時發生錯誤");
  }
});

// Google OAuth 路由
router.get(
  "/google",

  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  async (req, res) => {
    try {
      const tokenObject = {
        _id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      };
      const token = jwt.sign(tokenObject, process.env.PASSWORD_SECRET);

      // 確保 introduction 存在，如果不存在則設為空字串
      if (req.user.introduction === undefined) {
        req.user.introduction = "";
        await req.user.save();
      }

      const userData = {
        msg: "Login successful",
        token: "JWT " + token,
        user: {
          _id: req.user._id,
          email: req.user.email,
          username: req.user.username,
          googleId: req.user.googleId,
          role: req.user.role,
          password: req.user.password ? true : false,
          createdAt: req.user.createdAt,
          introduction: req.user.introduction,
        },
      };

      const userDataParam = encodeURIComponent(JSON.stringify(userData));
      res.redirect(`${process.env.FRONTEND_URL}/profile?data=${userDataParam}`);
    } catch (error) {
      console.error("Google callback error:", error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

router.post(
  "/role",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { role } = req.body;
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).send("用戶不存在");
      }

      user.role = role;
      await user.save();

      // 生成新的 JWT token
      const tokenObject = {
        _id: user._id,
        email: user.email,
        role: user.role,
      };
      const token = jwt.sign(tokenObject, process.env.PASSWORD_SECRET);

      return res.status(200).send({
        msg: "角色設置成功",
        token: "JWT " + token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          introduction: user.introduction,
        },
      });
    } catch (e) {
      console.error("更新角色時發生錯誤:", e);
      return res.status(500).send("伺服器錯誤，請稍後再試");
    }
  }
);

router.get("/publicProfile/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).send("用戶不存在");
  }

  res.status(200).send(user);
});

module.exports = router;
