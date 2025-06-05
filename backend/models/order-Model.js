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
        store: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        image: {
          type: String,
          required: true,
        },
        weight: {
          type: Number,
          required: true,
        },
        storeUsername: {
          type: String,
          required: true,
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

module.exports = mongoose.model("Order", orderSchema);
