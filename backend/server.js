const express = require("express");
const app = express();
const cors = require("cors");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
require("dotenv").config();
const passport = require("passport");
require("./config/passport")(passport);
const session = require("express-session");

const authRoute = require("./routes").auth;
const beanRoute = require("./routes").bean;
const publicBeanRoute = require("./routes").publicBean;
const cartRoute = require("./routes").cart;
const articleRoute = require("./routes").article;
const publicArticleRoute = require("./routes").publicArticle;
const knowledgeRoute = require("./routes").knowledge;
const paymentRoute = require("./routes").payment;

// 避免資料遺失，釋放資源，提成穩定性

// 處理完現有請求，關閉伺服器，關閉 MongoDB，安全結束程式
const gracefulShutdown = () => {
  console.log("開始優雅關閉...");

  // HTTP 伺服器停止接收連線，等待現有請求處理完畢，避免資料遺失
  server.close(() => {
    console.log("HTTP 服務器已關閉");
    mongoose.connection.close(false, () => {
      console.log("MongoDB 連接已關閉");
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error("無法優雅關閉，強制退出");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

//避免未被 try catch 的異常導致程式崩潰
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
app.use(
  cors({
    origin: ["https://coffee-e-commerce.zeabur.app", "http://localhost:3000"],
    credentials: true,
  })
);
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
app.use("/api/payment", paymentRoute);

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
