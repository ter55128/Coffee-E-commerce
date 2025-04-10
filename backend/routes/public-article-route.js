const express = require("express");
const router = express.Router();
const Article = require("../models").Article;

// 獲取所有文章
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find({})
      .populate("author", ["username"])
      .populate("comments.author", ["username"])
      .sort({ createdAt: -1 })
      .exec();
    return res.status(200).send(articles);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 獲取單篇文章
router.get("/:_id", async (req, res) => {
  try {
    const article = await Article.findById(req.params._id)
      .populate("author", ["username"])
      .populate("comments.author", ["username"])
      .exec();
    if (!article) {
      return res.status(404).send("文章不存在");
    }
    return res.status(200).send(article);
  } catch (e) {
    return res.status(500).send(e);
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const articles = await Article.find({ author: req.params.id })
      .populate("author", ["username"])
      .exec();
    return res.status(200).send(articles);
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;
