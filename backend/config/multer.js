const multer = require("multer");
const path = require("path");

// 配置存儲
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/beans"); // 圖片存儲路徑
  },
  filename: (req, file, cb) => {
    // 生成唯一的文件名
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "bean-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// 文件過濾器
const fileFilter = (req, file, cb) => {
  // 只接受圖片文件
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("只能上傳圖片文件！"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制文件大小為 5MB
  },
});

module.exports = upload;
