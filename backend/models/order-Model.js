const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    Email: {
      type: String,
      required: true,
    },
    items: [
      {
        beanID: {
          type: Schema.Types.ObjectId,
          ref: "Bean",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    description: {
      type: String,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["WEBATM", "CREDIT", "APPLEPAY", "ANDROIDPAY", "SAMSUNGPAY"],
    },
    paymentTime: {
      type: Date,
    },
    tradeNo: {
      type: String,
    },
  },
  { timestamps: true }
);

// 檢查訂單狀態的方法
orderSchema.methods.isPaid = function () {
  return this.status === "paid";
};

orderSchema.methods.isShipped = function () {
  return this.status === "shipped";
};

orderSchema.methods.isDelivered = function () {
  return this.status === "delivered";
};

orderSchema.methods.isCancelled = function () {
  return this.status === "cancelled";
};

// 更新訂單狀態的方法
orderSchema.methods.updateStatus = async function (newStatus) {
  this.status = newStatus;
  this.updatedAt = Date.now();
  return await this.save();
};

// 更新支付狀態的方法
orderSchema.methods.updatePaymentStatus = async function (
  status,
  transactionId = null
) {
  this.paymentDetails.paymentStatus = status;
  if (transactionId) {
    this.paymentDetails.transactionId = transactionId;
  }
  if (status === "paid") {
    this.paymentDetails.paymentTime = Date.now();
    this.status = "paid";
  }
  return await this.save();
};

// 虛擬欄位：訂單創建時間的格式化
orderSchema.virtual("createdAtFormatted").get(function () {
  return new Date(this.createdAt).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
  });
});

// 虛擬欄位：訂單狀態的中文描述
orderSchema.virtual("statusText").get(function () {
  const statusMap = {
    pending: "待付款",
    paid: "已付款",
    shipped: "已出貨",
    delivered: "已送達",
    cancelled: "已取消",
    refunded: "已退款",
  };
  return statusMap[this.status] || this.status;
});

// 索引
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ status: 1 });
orderSchema.index({ "items.store": 1 });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
