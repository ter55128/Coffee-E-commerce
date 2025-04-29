const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();
const querystring = require("querystring");

class NewebpayService {
  constructor() {
    this.merchantID = process.env.NEWEBPAY_MERCHANT_ID;
    this.hashKey = process.env.NEWEBPAY_HASH_KEY;
    this.hashIV = process.env.NEWEBPAY_HASH_IV;
    this.returnURL =
      process.env.RETURN_URL || "http://localhost:3000/payment/callback";
    this.notifyURL =
      process.env.NOTIFY_URL || "http://localhost:8080/api/payment/notify";
  }

  createAesEncrypt(paymentdata) {
    // URL encode
    const dataStr = querystring.stringify(paymentdata);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      this.hashKey,
      this.hashIV
    );
    let encrypted = cipher.update(dataStr, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  }

  createShaEncrypt(aesEncrypt) {
    const sha = crypto.createHash("sha256");
    const plainText = `HashKey=${this.hashKey}&${aesEncrypt}&HashIV=${this.hashIV}`;

    const shaEncrypt = sha.update(plainText).digest("hex").toUpperCase();
    return shaEncrypt;
  }

  decryptNotifyTradeInfo(tradeInfo) {
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      this.hashKey,
      this.hashIV
    );
    let decrypted = decipher.update(tradeInfo, "hex", "utf8");
    decrypted += decipher.final("utf8");
    decrypted = decrypted.replace(/[\x00-\x20]+$/g, "");
    try {
      return JSON.parse(decrypted);
    } catch (e) {
      console.log("解密失敗:", e);
    }
  }

  decryptCallbackTradeInfo(tradeInfo) {
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      this.hashKey,
      this.hashIV
    );
    let decrypted = decipher.update(tradeInfo, "hex", "utf8");
    decrypted += decipher.final("utf8");
    decrypted = decrypted.replace(/[\x00-\x20]+$/g, "");
    try {
      return decrypted;
    } catch (e) {
      console.log("解密失敗:", e);
    }
  }
}

module.exports = new NewebpayService();
