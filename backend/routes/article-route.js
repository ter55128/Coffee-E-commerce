const express = require("express");
const router = express.Router();
const Article = require("../models").Article;

// 中間件：檢查用戶是否登入
router.use((req, res, next) => {
  console.log("Article route middleware");
  if (!req.user) {
    return res.status(401).send("請先登入");
  }
  next();
});

// 發表新文章
router.post("/", async (req, res) => {
  try {
    console.log(req.user._id);
    const { title, content } = req.body;
    console.log(req.body);
    // 驗證標題和內容
    if (!title || !content) {
      return res.status(400).send("標題和內容不能為空");
    }
    if (title.length < 2 || title.length > 100) {
      return res.status(400).send("標題長度必須在2-100字之間");
    }
    if (content.length < 10 || content.length > 5000) {
      return res.status(400).send("內容長度必須在10-5000字之間");
    }

    const newArticle = new Article({
      title,
      content,
      author: req.user._id,
      comments: [],
    });
    console.log(newArticle);

    const savedArticle = await newArticle.save();
    const populatedArticle = await Article.findById(savedArticle._id)
      .populate("author", ["username"])
      .exec();

    return res.status(200).send(populatedArticle);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 發表評論
router.post("/:_id/comment", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).send("評論內容不能為空");
    }
    if (content.length > 500) {
      return res.status(400).send("評論內容不能超過500字");
    }

    const article = await Article.findById(req.params._id);
    if (!article) {
      return res.status(404).send("文章不存在");
    }

    const newComment = {
      content,
      author: req.user._id,
    };

    article.comments.push(newComment);
    await article.save();

    // 獲取最新添加的評論並填充作者信息
    const populatedComment = await Article.findOne(
      { _id: article._id },
      { comments: { $slice: -1 } }
    ).populate("comments.author", ["username"]);

    return res.status(200).send(populatedComment.comments[0]);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 刪除文章（只有作者可以刪除）
router.delete("/:_id", async (req, res) => {
  try {
    const article = await Article.findById(req.params._id);
    if (!article) {
      return res.status(404).send("文章不存在");
    }
    if (!article.author.equals(req.user._id)) {
      return res.status(403).send("只有作者可以刪除文章");
    }

    await Article.deleteOne({ _id: req.params._id });
    return res.status(200).send("文章已刪除");
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 更新文章（只有作者可以更新）
router.patch("/:_id", async (req, res) => {
  try {
    console.log(req.user);
    const { title, content } = req.body;
    const article = await Article.findById(req.params._id);

    if (!article) {
      return res.status(404).send("文章不存在");
    }
    if (!article.author.equals(req.user._id)) {
      return res.status(403).send("只有作者可以更新文章");
    }

    // 驗證更新的內容
    if (title && (title.length < 2 || title.length > 100)) {
      return res.status(400).send("標題長度必須在2-100字之間");
    }
    if (content && (content.length < 10 || content.length > 5000)) {
      return res.status(400).send("內容長度必須在10-5000字之間");
    }

    const updatedArticle = await Article.findOneAndUpdate(
      { _id: req.params._id },
      { title, content },
      { new: true }
    ).populate("author", ["username"]);

    return res.status(200).send(updatedArticle);
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;
