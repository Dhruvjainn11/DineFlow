// server/services/paymentService.js
import Razorpay from 'razorpay';
import Stripe from 'stripe';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Cafe from '../models/Cafe.js';

class PaymentService {
  constructor() {
    this.razorpayInstances = new Map(); // Store instances per cafe
    this.stripeInstances = new Map();
  }

  // Get or create Razorpay instance for a cafe
  getRazorpayInstance(cafe) {
    if (!cafe.paymentDetails.razorpay.enabled || 
        !cafe.paymentDetails.razorpay.keyId || 
        !cafe.paymentDetails.razorpay.keySecret) {
      throw new Error('Razorpay is not configured for this cafe');
    }

    const cacheKey = cafe._id.toString();
    if (!this.razorpayInstances.has(cacheKey)) {
      const instance = new Razorpay({
        key_id: cafe.paymentDetails.razorpay.keyId,
        key_secret: cafe.paymentDetails.razorpay.keySecret,
      });
      this.razorpayInstances.set(cacheKey, instance);
    }

    return this.razorpayInstances.get(cacheKey);
  }

  // Get or create Stripe instance for a cafe
  getStripeInstance(cafe) {
    if (!cafe.paymentDetails.stripe.enabled || 
        !cafe.paymentDetails.stripe.secretKey) {
      throw new Error('Stripe is not configured for this cafe');
    }

    const cacheKey = cafe._id.toString();
    if (!this.stripeInstances.has(cacheKey)) {
      const instance = new Stripe(cafe.paymentDetails.stripe.secretKey);
      this.stripeInstances.set(cacheKey, instance);
    }

    return this.stripeInstances.get(cacheKey);
  }

  // Create Razorpay order
  async createRazorpayOrder(cafeId, orderId, amount, currency = 'INR') {
    try {
      const cafe = await Cafe.findById(cafeId);
      if (!cafe) {
        throw new Error('Cafe not found');
      }

      // Check if cafe has online payments feature
      if (!cafe.hasFeature('onlinePayments')) {
        throw new Error('Online payments not available for this cafe plan');
      }

      const razorpay = this.getRazorpayInstance(cafe);
      
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency: currency,
        receipt: `order_${orderId}`,
        payment_capture: 1,
        notes: {
          cafe_id: cafeId.toString(),
          order_id: orderId.toString(),
          cafe_name: cafe.name
        }
      });

      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status
      };
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  // Create Stripe payment intent
  async createStripePaymentIntent(cafeId, orderId, amount, currency = 'inr') {
    try {
      const cafe = await Cafe.findById(cafeId);
      if (!cafe) {
        throw new Error('Cafe not found');
      }

      if (!cafe.hasFeature('onlinePayments')) {
        throw new Error('Online payments not available for this cafe plan');
      }

      const stripe = this.getStripeInstance(cafe);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amount in cents/paise
        currency: currency,
        metadata: {
          cafe_id: cafeId.toString(),
          order_id: orderId.toString(),
          cafe_name: cafe.name
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('Error creating Stripe payment intent:', error);
      throw error;
    }
  }

  // Verify Razorpay payment
  async verifyRazorpayPayment(cafeId, paymentData) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
      
      const cafe = await Cafe.findById(cafeId);
      if (!cafe) {
        throw new Error('Cafe not found');
      }

      // Generate expected signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', cafe.paymentDetails.razorpay.keySecret)
        .update(body.toString())
        .digest('hex');

      const isAuthentic = expectedSignature === razorpay_signature;

      if (isAuthentic) {
        // Get payment details from Razorpay
        const razorpay = this.getRazorpayInstance(cafe);
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        
        return {
          isValid: true,
          payment: {
            id: payment.id,
            amount: payment.amount / 100, // Convert from paise to rupees
            currency: payment.currency,
            status: payment.status,
            method: payment.method,
            gateway: 'razorpay',
            gatewayResponse: payment
          }
        };
      } else {
        return {
          isValid: false,
          error: 'Invalid payment signature'
        };
      }
    } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  // Verify Stripe payment
  async verifyStripePayment(cafeId, paymentIntentId) {
    try {
      const cafe = await Cafe.findById(cafeId);
      if (!cafe) {
        throw new Error('Cafe not found');
      }

      const stripe = this.getStripeInstance(cafe);
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        isValid: paymentIntent.status === 'succeeded',
        payment: {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100, // Convert from cents/paise
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          method: 'card',
          gateway: 'stripe',
          gatewayResponse: paymentIntent
        }
      };
    } catch (error) {
      console.error('Error verifying Stripe payment:', error);
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  // Update order payment status after successful payment
  async updateOrderPaymentStatus(orderId, paymentDetails) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      order.paymentStatus = 'Completed';
      order.paymentCompletedAt = new Date();
      order.paymentDetails = {
        method: 'online',
        transactionId: paymentDetails.id,
        gateway: paymentDetails.gateway,
        gatewayResponse: paymentDetails.gatewayResponse
      };

      await order.save();
      return order;
    } catch (error) {
      console.error('Error updating order payment status:', error);
      throw error;
    }
  }

  // Get payment gateway configuration for frontend
  getPaymentConfig(cafe) {
    const config = {};

    if (cafe.hasFeature('onlinePayments')) {
      if (cafe.paymentDetails.razorpay.enabled && cafe.paymentDetails.razorpay.keyId) {
        config.razorpay = {
          enabled: true,
          keyId: cafe.paymentDetails.razorpay.keyId
        };
      }

      if (cafe.paymentDetails.stripe.enabled && cafe.paymentDetails.stripe.publishableKey) {
        config.stripe = {
          enabled: true,
          publishableKey: cafe.paymentDetails.stripe.publishableKey
        };
      }
    }

    return config;
  }

  // Process refund (if needed)
  async processRefund(cafeId, paymentId, amount, gateway) {
    try {
      const cafe = await Cafe.findById(cafeId);
      if (!cafe) {
        throw new Error('Cafe not found');
      }

      let refundResult;

      if (gateway === 'razorpay') {
        const razorpay = this.getRazorpayInstance(cafe);
        refundResult = await razorpay.payments.refund(paymentId, {
          amount: Math.round(amount * 100)
        });
      } else if (gateway === 'stripe') {
        const stripe = this.getStripeInstance(cafe);
        refundResult = await stripe.refunds.create({
          payment_intent: paymentId,
          amount: Math.round(amount * 100)
        });
      } else {
        throw new Error('Unsupported payment gateway for refund');
      }

      return {
        success: true,
        refund: refundResult
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new PaymentService();
