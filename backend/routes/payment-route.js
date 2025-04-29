const router = require("express").Router();
const NewebpayService = require("../services/newebpay-service");
const Order = require("../models/order-Model");
const dotenv = require("dotenv");
require("dotenv").config();

router.post("/createOrder", async (req, res) => {
  try {
    console.log("資料傳到後端");
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
      paymentDetails: {
        paymentStatus: "pending",
      },
    });
    console.log(order);
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
      Email: order.Email,
    };

    console.log("外層 MerchantID:", process.env.NEWEBPAY_MERCHANT_ID);
    console.log("HashKey:", process.env.NEWEBPAY_HASH_KEY);
    console.log("HashIV:", process.env.NEWEBPAY_HASH_IV);
    console.log("加密前 paymentdata.MerchantID:", paymentdata.MerchantID);
    const tradeInfo = await NewebpayService.createAesEncrypt(paymentdata);
    const tradeSha = await NewebpayService.createShaEncrypt(tradeInfo);
    const decrypted = await NewebpayService.decryptTradeInfo(tradeInfo);
    console.log("解密後 MerchantID:", decrypted.MerchantID);
    console.log("TradeInfo:", tradeInfo);
    console.log(
      "TradeSha 計算字串:",
      `HashKey=${process.env.NEWEBPAY_HASH_KEY}&${tradeInfo}&HashIV=${process.env.NEWEBPAY_HASH_IV}`
    );
    console.log("TradeSha:", tradeSha);

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
});

router.post("/notify", async (req, res) => {
  try {
    console.log("notify");
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
