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

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((e) => console.log(e));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/user", authRoute);
// beans route is protected by jwt strategy
// if request header doesn't have jwt token, it will be unauthorized
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

app.listen(8080, () => {
  console.log(`Server is listening on port 8080`);
});
