const router = require("express").Router();
const NewebpayService = require("../services/newebpay-service");
const Order = require("../models/order-Model");
const dotenv = require("dotenv");
require("dotenv").config();

router.post("/createOrder", async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.user);
    console.log("資料傳到後端");
    const { cartItems, totalAmount } = req.body;
    const TimeStamp = Math.floor(Date.now() / 1000);
    // 創建訂單
    const order = await Order.create({
      user: req.user._id,
      Email: req.user.email,
      items: cartItems,
      totalAmount: totalAmount,
      orderNumber: TimeStamp,
      status: "pending",
      description: `咖啡豆訂單-${TimeStamp}`,
      paymentDetails: {
        paymentStatus: "pending",
      },
    });
    console.log(order);
    // 藍新金流表單所需資料
    const paymentdata = {
      MerchantID: process.env.NEWEBPAY_MERCHANT_ID,
      RespondType: "JSON",
      TimeStamp,
      Version: "2.2",
      MerchantOrderNo: order.orderNumber,
      Amt: order.totalAmount,
      ItemDesc: order.description,
      ReturnURL: process.env.NEWEBPAY_RETURN_URL,
      NotifyURL: process.env.NEWEBPAY_NOTIFY_URL,
      CustomerURL: process.env.NEWEBPAY_CANCEL_URL,
      Email: order.Email,
    };
    console.log("外層 MerchantID:", process.env.NEWEBPAY_MERCHANT_ID);
    console.log("加密前 paymentdata.MerchantID:", paymentdata.MerchantID);
    const tradeInfo = await NewebpayService.createAesEncrypt(paymentdata);
    const tradeSha = await NewebpayService.createShaEncrypt(tradeInfo);
    const decrypted = NewebpayService.decryptTradeInfo(tradeInfo);
    console.log("解密後 MerchantID:", decrypted.MerchantID);

    res.json({
      paymentFormData: {
        MerchantID: process.env.NEWEBPAY_MERCHANT_ID,
        TradeInfo: tradeInfo,
        TradeSha: tradeSha,
        Version: "2.2",
      },
      paymentUrl: process.env.NEWEBPAY_PAY_URL,
    });
    console.log(res.json);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/notify", async (req, res) => {
  try {
    const { TradeInfo } = req.body;
    const decryptedData = NewebpayService.decryptTradeInfo(TradeInfo);

    // 更新訂單狀態
    if (decryptedData.Status === "SUCCESS") {
      await Order.findOneAndUpdate(
        { orderNumber: decryptedData.MerchantOrderNo },
        { status: "paid", paymentDetails: decryptedData }
      );
    }

    res.send("OK");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
