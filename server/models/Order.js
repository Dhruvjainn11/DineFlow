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
    cafeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cafe',
      required: true,
      index: true
    },
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
    // The total amount will be calculated and set by the server
    totalAmount: {
      type: Number,
      required: true,
    },
    // Round-off logic fields
    roundOffAmount: {
      type: Number,
      default: 0,
      min: -0.5,
      max: 0.5
    },
    finalAmount: {
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
    
    // Additional order details
    customerName: {
      type: String,
      trim: true
    },
    customerPhone: {
      type: String,
      trim: true
    },
    specialInstructions: {
      type: String,
      trim: true
    },
    
    // Pricing details
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    gstDetails: {
      gstNumber: { type: String, trim: true },
      totalGstAmount: { type: Number, default: 0, min: 0 },
      ratesApplied: [{
        _id: false,
        rateName: { type: String, enum: ['CGST', 'SGST', 'IGST'] },
        percentage: { type: Number },
        amount: { type: Number }
      }]
    },
    serviceCharge: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Order type and delivery info
    orderType: {
      type: String,
      enum: ['dine-in', 'takeaway', 'delivery'],
      default: 'dine-in'
    },
    
    // Staff assignment
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Time tracking
    estimatedTime: {
      type: Number // in minutes
    },
    preparationStartedAt: {
      type: Date
    },
    readyAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    
    // Payment details for online payments
    paymentDetails: {
      method: {
        type: String,
        enum: ['cash', 'card', 'online', 'upi'],
        default: 'cash'
      },
      transactionId: String,
      gateway: String, // razorpay, stripe, etc.
      gatewayResponse: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
orderSchema.index({ cafeId: 1, createdAt: -1 });
orderSchema.index({ cafeId: 1, status: 1 });
orderSchema.index({ cafeId: 1, tableNumber: 1 });
orderSchema.index({ cafeId: 1, paymentStatus: 1 });
orderSchema.index({ cafeId: 1, orderType: 1 });
orderSchema.index({ assignedTo: 1, status: 1 });

// Method to calculate total with tax and service charge
orderSchema.methods.calculateTotal = function() {
  const totalGst = this.gstDetails ? this.gstDetails.totalGstAmount : 0;
  this.totalAmount = this.subtotal + totalGst + this.serviceCharge - this.discount;
  
  // Calculate round-off
  const decimal = this.totalAmount % 1;
  if (decimal >= 0.5) {
    this.roundOffAmount = 1 - decimal;
    this.finalAmount = Math.ceil(this.totalAmount);
  } else {
    this.roundOffAmount = -decimal;
    this.finalAmount = Math.floor(this.totalAmount);
  }
  
  return this.totalAmount;
};

// Virtual for order duration
orderSchema.virtual('duration').get(function() {
  if (this.completedAt && this.createdAt) {
    return Math.round((this.completedAt - this.createdAt) / (1000 * 60)); // in minutes
  }
  return null;
});

// Static method to get orders by cafe and date range
orderSchema.statics.getOrdersByDateRange = function(cafeId, startDate, endDate) {
  return this.find({
    cafeId: cafeId,
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ createdAt: -1 });
};

const Order = mongoose.model("Order", orderSchema);
export default Order;
