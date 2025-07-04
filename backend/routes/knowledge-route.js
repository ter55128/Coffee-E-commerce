const router = require("express").Router();
const Knowledge = require("../models/knowledge-Model");

router.get("/", async (req, res) => {
  try {
    const knowledges = await Knowledge.find({}, "title icon");
    res.status(200).json(knowledges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:title", async (req, res) => {
  try {
    const knowledge = await Knowledge.findOne({
      title: decodeURIComponent(req.params.title),
    });
    if (!knowledge) {
      return res.status(404).json({ message: "找不到該內容" });
    }
    res.status(200).json(knowledge);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
