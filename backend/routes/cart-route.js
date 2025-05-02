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
    const validItems = [];

    for (const item of cart.items) {
      const bean = await Bean.findById(item.beanID);
      if (bean) {
        item.beanID.store = bean.store;
        validItems.push(item);
      }
    }
    cart.items = validItems;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).send("Get cart failed");
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
        items: [{ beanID, quantity: 1, price: bean.price }],
      });
      await cart.save();
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
          beanID: beanID,
          quantity: 1,
          price: bean.price,
        };

        cart.items.push(newItem);
      }

      await cart.save();

      res.status(200).send({ message: "商品已添加到購物車", cart });
    }
  } catch (err) {
    res.status(500).send("Add item to cart failed");
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
    res.status(500).send("伺服器錯誤");
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
    res.status(500).send("Remove item from cart failed");
  }
});

router.delete("/clear", async (req, res) => {
  try {
    console.log("收到清空購物車的請求", req);
    const cart = await Cart.deleteMany({ user: req.user._id });
    res.json({ message: "購物車已清空", cart });
  } catch (err) {
    res.status(500).send("Clear cart failed");
  }
});
module.exports = router;
