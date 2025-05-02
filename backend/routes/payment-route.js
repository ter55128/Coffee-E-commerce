const router = require("express").Router();
const NewebpayService = require("../services/newebpay-service");
const Order = require("../models/order-Model");
const Cart = require("../models/cart-Model");
const dotenv = require("dotenv");
require("dotenv").config();
const passport = require("passport");
require("../config/passport")(passport);

router.post(
  "/createOrder",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      console.log("資料傳到payment-route");
      const { cartItems, totalAmount } = req.body;
      const timeStamp = Math.floor(Date.now() / 1000);
      // 創建訂單
      const order = await Order.create({
        user: req.user._id,
        Email: req.user.email,
        items: cartItems,
        totalAmount: totalAmount,
        orderNumber: timeStamp,
        status: "pending",
        description: `咖啡豆訂單-${timeStamp}`,
      });

      // 藍新金流表單所需資料
      const paymentdata = {
        MerchantID: process.env.NEWEBPAY_MERCHANT_ID,
        RespondType: "JSON",
        TimeStamp: timeStamp,
        Version: "2.2",
        MerchantOrderNo: order.orderNumber,
        Amt: order.totalAmount,
        ItemDesc: order.description,
        ReturnURL: process.env.NEWEBPAY_RETURN_URL,
        NotifyURL: process.env.NEWEBPAY_NOTIFY_URL,
        ClientBackURL: process.env.NEWEBPAY_CLIENT_BACK_URL,
        Email: order.Email,
      };

      const tradeInfo = await NewebpayService.createAesEncrypt(paymentdata);
      const tradeSha = await NewebpayService.createShaEncrypt(tradeInfo);

      res.json({
        paymentFormData: {
          MerchantID: paymentdata.MerchantID,
          TradeInfo: tradeInfo,
          TradeSha: tradeSha,
          Version: "2.2",
        },
        paymentUrl: process.env.NEWEBPAY_PAY_URL,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  "/continuePayment",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      console.log("收到繼續付款", req.body.orderId);
      const order = await Order.findOne({
        _id: req.body.orderId,
        user: req.user._id,
      });
      if (!order) {
        return res.status(404).json({ error: "訂單不存在" });
      }
      console.log("訂單資料", order);
      const timeStamp = Math.floor(Date.now() / 1000);

      const paymentdata = {
        MerchantID: process.env.NEWEBPAY_MERCHANT_ID,
        RespondType: "JSON",
        TimeStamp: timeStamp,
        Version: "2.2",
        MerchantOrderNo: order.orderNumber,
        Amt: order.totalAmount,
        ItemDesc: order.description,
        ReturnURL: process.env.NEWEBPAY_RETURN_URL,
        NotifyURL: process.env.NEWEBPAY_NOTIFY_URL,
        ClientBackURL: process.env.NEWEBPAY_CLIENT_BACK_URL,
        Email: order.Email,
        CREDIT: 1,
        APPLEPAY: 1,
        ANDROIDPAY: 1,
        SAMSUNGPAY: 1,
      };

      console.log("藍新金流表單所需資料", paymentdata);
      const tradeInfo = await NewebpayService.createAesEncrypt(paymentdata);
      const tradeSha = await NewebpayService.createShaEncrypt(tradeInfo);

      res.json({
        paymentFormData: {
          MerchantID: paymentdata.MerchantID,
          TradeInfo: tradeInfo,
          TradeSha: tradeSha,
          Version: "2.2",
        },
        paymentUrl: process.env.NEWEBPAY_PAY_URL,
      });
    } catch (error) {
      console.error("繼續付款錯誤:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.post("/notify", async (req, res) => {
  try {
    console.log("收到藍新 Notify:", req.body);
    const { TradeInfo } = req.body;
    const decryptedData = NewebpayService.decryptTradeInfo(TradeInfo);
    console.log("解密後資料:", decryptedData);

    if (decryptedData.Status === "SUCCESS") {
      const updatedOrder = await Order.findOneAndUpdate(
        { orderNumber: decryptedData.Result.MerchantOrderNo },
        {
          status: "paid",
          paymentType: decryptedData.Result.PaymentType,
          paymentTime: decryptedData.Result.PayTime,
          tradeNo: decryptedData.Result.TradeNo,
        },
        { new: true }
      );
      console.log("更新訂單:", updatedOrder);
      if (updatedOrder) {
        const clearCart = await Cart.deleteMany({ user: updatedOrder.user });
        console.log(`${updatedOrder.user}購物車已清空`, clearCart);
      } else {
        console.log("訂單未找到", decryptedData.Result.MerchantOrderNo);
      }
    }
    res.send("OK");
  } catch (error) {
    console.error("Notify 處理錯誤:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/return", async (req, res) => {
  try {
    console.log("收到藍新Return:", req.body);
    const contentType = req.headers["content-type"];
    console.log("contentType:", contentType);
    // contentType: application/x-www-form-urlencoded
    // 有使用query string轉換 但一直顯示MerchantID 內外層不符合 ？
    res.redirect(`${process.env.FRONTEND_URL}/payment/return`);
  } catch (error) {
    console.error("Return 處理錯誤:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get(
  "/orders/:userId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      console.log("收到訂單查詢");
      const { userId } = req.params;
      if (userId !== req.user._id.toString()) {
        return res.status(403).json({ error: "無權限" });
      }
      const orders = await Order.find({ user: userId });
      res.json(orders);
    } catch (error) {
      console.error("訂單查詢錯誤:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
