const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 500,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
  },
  content: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 5000,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

articleSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Article", articleSchema);
