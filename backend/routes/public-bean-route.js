const express = require("express");
const router = express.Router();
const Bean = require("../models").Bean;

// 公開的獲取所有商品路由
router.get("/", async (req, res) => {
  try {
    let beans = await Bean.find({})
      .populate("store", ["username", "email", "createdAt"])
      .exec();
    return res.status(200).send(beans);
  } catch (e) {
    return res.status(500).send(e);
  }
});

router.get("/:id", async (req, res) => {
  try {
    let bean = await Bean.findById(req.params.id)
      .populate("store", ["username", "email", "createdAt"])
      .exec();
    return res.status(200).send(bean);
  } catch (e) {
    return res.status(500).send(e);
  }
});

router.get("/store/:id", async (req, res) => {
  try {
    let beans = await Bean.find({ store: req.params.id })
      .populate("store", ["username", "createdAt"])
      .exec();
    return res.status(200).send(beans);
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;
