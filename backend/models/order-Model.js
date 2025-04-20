const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
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
      store: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"],
    default: "pending",
  },
  paymentDetails: {
    paymentMethod: {
      type: String,
      enum: ["credit_card", "webatm", "vacc", "cvs"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    transactionId: String,
    paymentTime: Date,
  },
  shippingInfo: {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    note: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 更新時間中間件
orderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// 生成訂單編號的靜態方法
orderSchema.statics.generateOrderNumber = function () {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD${timestamp}${random}`;
};

// 計算訂單總金額的方法
orderSchema.methods.calculateTotal = function () {
  return this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

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
