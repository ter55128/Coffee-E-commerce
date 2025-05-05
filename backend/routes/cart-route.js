const express = require("express");
const router = express.Router();
const Cart = require("../models/cart-Model");
const Bean = require("../models/bean-Model");

router.use((req, res, next) => {
  if (!req.user) {
    return res.status(401).send("Unauthorized access");
  }
  next();
});
console.log("");

// 獲取購物車內容
router.get("/", async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.beanID"
    );
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
      });
      await cart.save();
      return res.json(cart);
    }

    let updated = false;
    const validItems = [];

    for (const item of cart.items) {
      const bean = await Bean.findById(item.beanID);
      if (bean) {
        // 即時同步商品資料
        item.price = bean.price;
        item.title = bean.title;
        item.image = bean.image;
        item.weight = bean.weight;
        item.store = bean.store;
        updated = true;
        validItems.push(item);
      }
      // 如果 bean 不存在，該商品就不放進 validItems（代表商品已下架）
    }

    // 只保留有效商品
    cart.items = validItems;

    // 如果有更新才存檔
    if (updated) {
      await cart.save();
    }

    res.json(cart);
  } catch (err) {
    res.status(500).send("獲取購物車失敗，請稍候再試");
  }
});

// 添加商品到購物車
router.post("/", async (req, res) => {
  console.log("收到添加商品到購物車的請求");
  const { beanID } = req.body;
  const userID = req.user._id;

  try {
    let cart = await Cart.findOne({ user: userID });
    let bean = await Bean.findById(beanID);

    if (!cart) {
      cart = new Cart({
        user: userID,
        items: [
          {
            beanID: bean._id,
            quantity: 1,
            price: bean.price,
            store: bean.store,
            title: bean.title,
            image: bean.image,
            weight: bean.weight,
          },
        ],
      });

      await cart.save();
      return res.status(200).send({ message: "商品已添加到購物車", cart });
    }
    if (cart) {
      //  檢查商品是否已存在於購物車
      const itemIndex = cart.items.findIndex(
        (item) => item.beanID.toString() === beanID
      );

      if (itemIndex > -1) {
        //如果商品已存在於購物車，則增加數量
        cart.items[itemIndex].quantity += 1;
      } else if (itemIndex == -1) {
        //如果商品不存在於購物車，則新增商品

        const newItem = {
          beanID: bean._id,
          quantity: 1,
          price: bean.price,
          store: bean.store,
          title: bean.title,
          image: bean.image,
          weight: bean.weight,
        };

        cart.items.push(newItem);
      }

      await cart.save();
      res.status(200).send({ message: "商品已添加到購物車", cart });
    }
  } catch (err) {
    res.status(500).send("添加商品到購物車失敗，請稍候再試");
    console.log("錯誤", err);
  }
});

// 更新商品數量
router.put("/update/:beanID", async (req, res) => {
  try {
    let { beanID } = req.params;
    let { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });

    const itemIndex = cart.items.findIndex(
      (item) => item.beanID.toString() === beanID
    );

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1); // 移除商品
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).send("更新商品數量失敗，請稍候再試");
  }
});

// 移除商品
router.delete("/remove/:beanID", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    cart.items = cart.items.filter(
      (item) => item.beanID.toString() !== req.params.beanID
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).send("移除商品失敗，請稍候再試");
  }
});

router.delete("/clear", async (req, res) => {
  try {
    console.log("收到清空購物車的請求");
    const cart = await Cart.deleteMany({ user: req.user._id });
    res.json({ message: "購物車已清空", cart });
  } catch (err) {
    res.status(500).send("清空購物車失敗，請稍候再試");
  }
});
module.exports = router;
