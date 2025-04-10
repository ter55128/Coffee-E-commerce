const express = require("express");
const router = express.Router();
// 1 & 2 can be done in the same route
// const router = require("express").Router();
const Bean = require("../models").Bean;
const beanValidation = require("../validation").beanValidation;
const upload = require("../config/multer");

router.use((req, res, next) => {
  console.log("Receiving bean request");
  if (!req.user) {
    return res.status(401).send("Unauthorized access");
  }
  next();
});

// get a product by store id
router.get("/store/:_store_id", async (req, res) => {
  try {
    console.log(req.params);
    let { _store_id } = req.params;
    let beanFound = await Bean.find({ store: _store_id })
      .populate("store", ["username", "email"])
      .exec();
    return res.status(200).send(beanFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// get purchase history by customer id
// router.get("/customer/:_customer_id", async (req, res) => {
//   try {
//     let { _customer_id } = req.params;
//     let purchaseHistory = await Bean.find({
//       customers: _customer_id,
//     })
//       .populate("store", ["username", "email"])
//       .exec();
//     return res.status(200).send(purchaseHistory);
//   } catch (e) {
//     return res.status(500).send(e);
//   }
//});

// get a product by bean id
router.get("/:_id", async (req, res) => {
  try {
    let beanFound = await Bean.findById(req.params._id)
      .populate("store", ["username", "email"])
      .exec();
    return res.status(200).send(beanFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// post a new product
router.post("/", upload.single("image"), async (req, res) => {
  console.log(req.user, req.user._id);
  // validate request body
  let { error } = beanValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.user.isCustomer()) {
    return res.status(400).send("Customer cannot post products");
  }

  // create a new bean
  let { title, weight, cultivar, processing, roast, description, price } =
    req.body;
  try {
    const beanData = {
      title,
      weight,
      cultivar,
      processing,
      roast,
      description,
      price,
      store: req.user._id,
    };

    // 如果有上傳圖片，添加圖片路徑
    if (req.file) {
      beanData.image = `/uploads/beans/${req.file.filename}`;
    } else {
      beanData.image = "/uploads/beans/default.png";
    }

    let newBean = new Bean(beanData);
    let savedBean = await newBean.save();
    return res.status(200).send({ message: "New product posted", savedBean });
  } catch (e) {
    return res.status(500).send("Cannot post product");
  }
});

// update a product
router.patch("/:_id", upload.single("image"), async (req, res) => {
  try {
    let { _id } = req.params;

    // 檢查商品是否存在
    let beanFound = await Bean.findOne({ _id });
    if (!beanFound) {
      return res.status(400).send("商品不存在，無法更新");
    }

    // 檢查是否為商品擁有者
    if (!beanFound.store.equals(req.user._id)) {
      return res.status(403).send("只有商品擁有者可以更新商品");
    }

    // 準備更新數據
    const updateData = {
      title: req.body.title,
      weight: req.body.weight,
      cultivar: req.body.cultivar,
      processing: req.body.processing,
      roast: req.body.roast,
      description: req.body.description,
      price: req.body.price,
    };

    // 如果有新圖片上傳，添加到更新數據中
    if (req.file) {
      updateData.image = `/uploads/beans/${req.file.filename}`;
    }

    // 驗證更新數據
    const { error } = beanValidation(updateData);
    if (error) {
      // 如果驗證失敗且已上傳新圖片，刪除新上傳的圖片
      if (req.file) {
        const fs = require("fs");
        const path = require("path");
        fs.unlink(
          path.join(__dirname, "../public", updateData.image),
          (err) => {
            if (err) console.error("刪除失敗的上傳圖片時發生錯誤:", err);
          }
        );
      }
      return res.status(400).send(error.details[0].message);
    }

    // 更新商品
    let updatedBean = await Bean.findOneAndUpdate({ _id }, updateData, {
      new: true,
      runValidators: true,
    }).populate("store", ["username", "email"]);

    return res.status(200).send({
      message: "商品更新成功",
      updatedBean,
    });
  } catch (e) {
    console.error("更新商品時發生錯誤:", e);
    // 如果更新過程中出錯且已上傳新圖片，刪除新上傳的圖片
    if (req.file) {
      const fs = require("fs");
      const path = require("path");
      fs.unlink(
        path.join(__dirname, "../public/uploads/beans", req.file.filename),
        (err) => {
          if (err) console.error("刪除失敗的上傳圖片時發生錯誤:", err);
        }
      );
    }
    return res.status(500).send("更新商品時發生錯誤");
  }
});

// delete a product
router.delete("/:_id", async (req, res) => {
  console.log(req.user);
  let { _id } = req.params;
  try {
    // check if the product exists
    let beanFound = await Bean.findOne({ _id }).exec();
    if (!beanFound)
      return res.status(400).send("Product not found , cannot delete");

    // check if the product is owned by the user
    if (beanFound.store.equals(req.user._id)) {
      let deletedBean = await Bean.deleteOne({ _id }).exec();
      return res.status(200).send({ message: "Product deleted successfully" });
    } else {
      return res.status(403).send("Only the owner can delete the product");
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;
