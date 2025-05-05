const mongoose = require("mongoose");
const { Schema } = mongoose;

const beanSchema = new Schema({
  id: {
    type: String,
  },
  title: {
    type: String,
    required: [true, "title"],
  },
  weight: {
    type: Number,
    required: [true, "grams"],
    min: 50,
    max: 5000,
  },
  cultivar: {
    type: String,
    required: [true, "cultivar / blend"],
  },
  processing: {
    type: String,
    required: [true, "processing / blend"],
  },
  roast: {
    type: String,
    required: [true, "roast degree"],
  },
  description: {
    type: String,
    require: [true, "description"],
    minlength: 10,
    maxlength: 100,
  },
  price: {
    type: Number,
    require: [true, "price"],
    min: 100,
    max: 10000,
  },
  store: {
    type: mongoose.Schema.Types.ObjectId, // primary key
    ref: "User",
  },
  soldCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: String, // 存儲圖片的路徑
    default: "default-bean.jpg", // 預設圖片
  },
});

module.exports = mongoose.model("Bean", beanSchema);
