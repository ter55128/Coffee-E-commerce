const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoute = require("./routes").auth;
const beanRoute = require("./routes").bean;
const publicBeanRoute = require("./routes").publicBean;
const cartRoute = require("./routes").cart;
const articleRoute = require("./routes").article;
const publicArticleRoute = require("./routes").publicArticle;
const passport = require("passport");
require("./config/passport")(passport);
const session = require("express-session");
const knowledgeRoute = require("./routes").knowledge;
const MongoStore = require("connect-mongo");

const gracefulShutdown = () => {
  console.log("開始優雅關閉...");
  server.close(() => {
    console.log("HTTP 服務器已關閉");
    mongoose.connection.close(false, () => {
      console.log("MongoDB 連接已關閉");
      process.exit(0);
    });
  });

  // 如果 10 秒內沒有完成關閉，強制退出
  setTimeout(() => {
    console.error("無法優雅關閉，強制退出");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

process.on("uncaughtException", (err) => {
  console.error("未捕獲的異常：", err);
});

process.on("unhandledRejection", (err) => {
  console.error("未處理的 Promise 拒絕：", err);
});

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((e) => console.log(e));
console.log(process.env.MONGO_URI);
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 24 * 60 * 60, // 1 天
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 天
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/user", authRoute);
// beans route is protected by jwt strategy
// if request header doesn't have jwt token, it will be unauthorized
app.use("/api/knowledges", knowledgeRoute);
app.use("/api/beans/public", publicBeanRoute);
app.use("/api/articles/public", publicArticleRoute);

app.use(
  "/api/beans",
  passport.authenticate("jwt", { session: false }),
  beanRoute
);
app.use(
  "/api/cart",
  passport.authenticate("jwt", { session: false }),
  cartRoute
);
app.use(
  "/api/articles",
  passport.authenticate("jwt", { session: false }),
  articleRoute
);

// 設置靜態文件服務
app.use("/uploads", express.static("public/uploads"));

// 確保上傳目錄存在
const fs = require("fs");
const uploadDir = "public/uploads/beans";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Routes
app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
