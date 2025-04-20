const router = require("express").Router();
const NewebpayService = require("../services/newebpay-service");
const Order = require("../models/order-model"); // 假設您有訂單模型

router.post("/create", async (req, res) => {
  try {
    const { cartItems, totalAmount, userEmail } = req.body;

    // 創建訂單
    const order = await Order.create({
      user: req.user._id,
      items: cartItems,
      totalAmount,
      orderNumber: `ORDER${Date.now()}`,
      status: "pending",
    });

    // 準備藍新金流所需資料
    const paymentData = {
      orderNumber: order.orderNumber,
      totalAmount: totalAmount,
      description: `咖啡豆訂單-${order.orderNumber}`,
      email: userEmail,
    };

    // 取得藍新金流表單所需資料
    const mpgData = NewebpayService.createMpgPayment(paymentData);

    res.json({
      paymentFormData: mpgData,
      paymentUrl: process.env.NEWEBPAY_PAY_URL,
    });
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
