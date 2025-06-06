// server/models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    totalPrice: {
      type: Number,
    
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Ready", "Completed"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Requested", "Completed"],
      default: "Pending",
    },
    paymentRequestedAt: {
      type: Date,
      default: null,
    },
    paymentCompletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
