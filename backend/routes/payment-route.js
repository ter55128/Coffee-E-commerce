const router = require("express").Router();
const NewebpayService = require("../services/newebpay-service");
const Order = require("../models/order-Model");
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

router.post("/notify", async (req, res) => {
  try {
    console.log("收到藍新 Notify:", req.body);
    const { TradeInfo } = req.body;
    const decryptedData = NewebpayService.decryptTradeInfo(TradeInfo);
    console.log("解密後資料:", decryptedData);

    if (decryptedData.Status === "SUCCESS") {
      await Order.findOneAndUpdate(
        { orderNumber: decryptedData.MerchantOrderNo },
        {
          status: "paid",
          paymentType: decryptedData.PaymentType,
          paymentTime: decryptedData.PaymentTime,
        }
      );
    }
    // 藍新建議回傳 "SUCCESS" 或 "OK"
    res.send("OK");
  } catch (error) {
    console.error("Notify 處理錯誤:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/order/:orderNumber", async (req, res) => {
  const { orderNumber } = req.params;
  const order = await Order.findOne({ orderNumber });
  res.json(order);
});

module.exports = router;
