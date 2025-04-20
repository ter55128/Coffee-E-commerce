const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();

class NewebpayService {
  constructor() {
    this.merchantID = process.env.NEWEBPAY_MERCHANT_ID;
    this.hashKey = process.env.NEWEBPAY_HASH_KEY;
    this.hashIV = process.env.NEWEBPAY_HASH_IV;
    this.returnURL =
      process.env.RETURN_URL || "http://localhost:3000/payment/callback";
    this.notifyURL =
      process.env.NOTIFY_URL || "http://localhost:8080/api/payment/notify";
    this.cancelURL = process.env.CANCEL_URL || "http://localhost:3000/cart";
  }

  createMpgPayment(order) {
    const data = {
      MerchantID: this.merchantID,
      RespondType: "JSON",
      TimeStamp: Math.floor(Date.now() / 1000),
      Version: "2.0",
      MerchantOrderNo: order.orderNumber,
      Amt: order.totalAmount,
      ItemDesc: order.description,
      ReturnURL: this.returnURL,
      NotifyURL: this.notifyURL,
      CustomerURL: this.cancelURL,
      Email: order.email,
    };

    const mpgAesEncrypt = this.createMpgAesEncrypt(data);
    const mpgShaEncrypt = this.createMpgShaEncrypt(mpgAesEncrypt);

    return {
      MerchantID: this.merchantID,
      TradeInfo: mpgAesEncrypt,
      TradeSha: mpgShaEncrypt,
      Version: "2.0",
    };
  }

  createMpgAesEncrypt(data) {
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      this.hashKey,
      this.hashIV
    );
    const encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
    return encrypted + cipher.final("hex");
  }

  createMpgShaEncrypt(aesEncrypt) {
    const sha = crypto.createHash("sha256");
    const plainText = `HashKey=${this.hashKey}&${aesEncrypt}&HashIV=${this.hashIV}`;
    return sha.update(plainText).digest("hex").toUpperCase();
  }

  decryptTradeInfo(tradeInfo) {
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      this.hashKey,
      this.hashIV
    );
    decipher.setAutoPadding(false);
    const decrypted = decipher.update(tradeInfo, "hex", "utf8");
    const plainText = decrypted + decipher.final("utf8");
    const result = plainText.replace(/[\x00-\x20]+/g, "");
    return JSON.parse(result);
  }
}

module.exports = new NewebpayService();
