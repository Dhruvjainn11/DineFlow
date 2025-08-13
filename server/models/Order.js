// server/models/Order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: [1, 'Quantity must be at least 1'] 
  },
  remark: { 
    type: String, 
    default: "" 
  },
  // Store the size details at the time of order
  size: {
    label: { type: String, trim: true },
    price: { type: Number, min: 0 },
  },
  // Store the price per item at the time of order for accuracy
  // This is separate from the base price in the MenuItem model.
  itemPrice: { 
    type: Number, 
    required: true, 
    min: 0 
  },
});

const orderSchema = new mongoose.Schema(
  {
    // Use the primitive table number for simplicity
    tableNumber: {
      type: Number,
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function(v) {
          return v.length > 0;
        },
        message: 'Order must contain at least one item.'
      }
    },
    // The total price will be calculated and set by the server
    totalPrice: {
      type: Number,
      required: true,
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