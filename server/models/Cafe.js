// server/models/Cafe.js
import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema({
  primaryColor: { 
    type: String, 
    default: '#3B82F6',
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'Primary color must be a valid hex color'
    }
  },
  secondaryColor: { 
    type: String, 
    default: '#F3F4F6',
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'Secondary color must be a valid hex color'
    }
  },
  logoUrl: { 
    type: String,
    default: ''
  },
  fontFamily: {
    type: String,
    default: 'Inter',
    enum: ['Inter', 'Roboto', 'Poppins', 'Open Sans', 'Lato']
  }
}, { _id: false });

const featuresSchema = new mongoose.Schema({
  // Basic Plan Features (always available)
  basicQRCodes: { type: Boolean, default: true },
  offlinePayments: { type: Boolean, default: true },
  sevenDayAnalytics: { type: Boolean, default: true },
  basicSupport: { type: Boolean, default: true },
  
  // Pro Plan Features (only for Pro plan)
  customBranding: { type: Boolean, default: false },
  themeCustomization: { type: Boolean, default: false },
  onlinePayments: { type: Boolean, default: false },
  premiumQRCodes: { type: Boolean, default: false },
  thirtyDayAnalytics: { type: Boolean, default: false },
  advancedAnalytics: { type: Boolean, default: false },
  prioritySupport: { type: Boolean, default: false },
  customDomain: { type: Boolean, default: false },
  whiteLabel: { type: Boolean, default: false },
  multiLocation: { type: Boolean, default: false },
  
  // Additional features that can be toggled
  kitchenDisplay: { type: Boolean, default: true },
  tableManagement: { type: Boolean, default: true },
  inventoryTracking: { type: Boolean, default: false },
  customerReviews: { type: Boolean, default: false },
  loyaltyProgram: { type: Boolean, default: false }
}, { _id: false });

const paymentDetailsSchema = new mongoose.Schema({
  // Razorpay
  razorpay: {
    keyId: { type: String, default: '' },
    keySecret: { type: String, default: '' },
    enabled: { type: Boolean, default: false }
  },
  // Stripe
  stripe: {
    publishableKey: { type: String, default: '' },
    secretKey: { type: String, default: '' },
    enabled: { type: Boolean, default: false }
  },
  // PayPal
  paypal: {
    clientId: { type: String, default: '' },
    clientSecret: { type: String, default: '' },
    enabled: { type: Boolean, default: false }
  }
}, { _id: false });

const subscriptionSchema = new mongoose.Schema({
  planType: {
    type: String,
    enum: ['basic', 'pro'],
    required: true,
    default: 'basic'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'trial'],
    default: 'trial'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: function() {
      // Default trial period of 14 days
      return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    }
  },
  trialEndDate: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    }
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  paymentHistory: [{
    amount: Number,
    currency: { type: String, default: 'USD' },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: String,
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    }
  }],
  extensionHistory: [{
    extendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    extensionDays: { type: Number, required: true },
    reason: { 
      type: String, 
      enum: ['Payment Received', 'Grace Period', 'Support', 'Other'],
      required: true 
    },
    previousEndDate: { type: Date, required: true },
    newEndDate: { type: Date, required: true },
    extendedAt: { type: Date, default: Date.now }
  }]
}, { _id: false });

const cafeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Cafe name is required'],
    trim: true,
    maxLength: [100, 'Cafe name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  subdomain: {
    type: String,
    unique: true,
    sparse: true, // Allows null values but ensures uniqueness
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty subdomain
        return /^[a-z0-9-]+$/.test(v) && v.length >= 3 && v.length <= 30;
      },
      message: 'Subdomain must be 3-30 characters long and contain only lowercase letters, numbers, and hyphens'
    }
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  
  // Subscription and Plan
  subscription: {
    type: subscriptionSchema,
    default: () => ({})
  },
  
  // Features based on plan
  features: {
    type: featuresSchema,
    default: () => ({})
  },
  
  // Theme and Branding
  theme: {
    type: themeSchema,
    default: () => ({})
  },
  
  // Payment Gateway Configuration
  paymentDetails: {
    type: paymentDetailsSchema,
    default: () => ({})
  },
  
  // Operational Settings
  settings: {
    timezone: { type: String, default: 'Asia/Kolkata' },
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'en' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    timeFormat: { type: String, default: '12' }, // 12 or 24 hour
    
    // Business hours
    operatingHours: {
      monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      sunday: { open: String, close: String, isOpen: { type: Boolean, default: true } }
    },
    
    // GST and Tax Settings
    hasGST: { type: Boolean, default: false },
    gstNumber: { type: String, trim: true, default: '' },
    gstRates: [{
      rateName: { 
        type: String, 
        enum: ['CGST', 'SGST', 'IGST'],
        required: true
      },
      percentage: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 30
      }
    }],
    
    // Service charge
    serviceCharge: { type: Number, default: 0, min: 0, max: 30 },
    serviceChargeType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' }
  },
  
  // Status and metadata
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  isDemo: {
    type: Boolean,
    default: false
  },
  
  // Analytics and tracking
  analytics: {
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalCustomers: { type: Number, default: 0 },
    lastOrderDate: Date,
    popularItems: [{
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
      orderCount: Number
    }]
  }
}, {
  timestamps: true
});

// Indexes for better performance
cafeSchema.index({ email: 1 });
cafeSchema.index({ subdomain: 1 });
cafeSchema.index({ 'subscription.status': 1 });
cafeSchema.index({ status: 1 });

// Virtual for full domain URL
cafeSchema.virtual('fullDomain').get(function() {
  if (this.subdomain) {
    return `${this.subdomain}.dineflow.com`;
  }
  return null;
});

// Method to check if cafe has a specific feature
cafeSchema.methods.hasFeature = function(featureName) {
  return this.features && this.features[featureName] === true;
};

// Method to check if subscription is active
cafeSchema.methods.isSubscriptionActive = function() {
  if (!this.subscription) return false;
  
  const now = new Date();
  return (
    this.subscription.status === 'active' && this.subscription.endDate > now
  ) || (
    this.subscription.status === 'trial' && this.subscription.trialEndDate > now
  );
};

// Method to check if subscription is expired
cafeSchema.methods.isSubscriptionExpired = function() {
  if (!this.subscription) return true;
  
  const now = new Date();
  return (
    this.subscription.status === 'inactive' ||
    (this.subscription.status === 'active' && this.subscription.endDate <= now) ||
    (this.subscription.status === 'trial' && this.subscription.trialEndDate <= now)
  );
};

// Method to get plan type
cafeSchema.methods.getPlanType = function() {
  if (!this.subscription) return 'basic';
  return this.subscription.planType;
};

// Method to update features based on plan
cafeSchema.methods.updateFeaturesForPlan = function(planType) {
  if (planType === 'pro') {
    this.features = {
      ...this.features,
      customBranding: true,
      themeCustomization: true,
      onlinePayments: true,
      premiumQRCodes: true,
      thirtyDayAnalytics: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customDomain: true,
      whiteLabel: true
    };
  } else {
    // Basic plan - disable pro features
    this.features = {
      ...this.features,
      customBranding: false,
      themeCustomization: false,
      onlinePayments: true,
      premiumQRCodes: false,
      thirtyDayAnalytics: false,
      advancedAnalytics: false,
      prioritySupport: false,
      customDomain: false,
      whiteLabel: false
    };
  }
};

// Pre-save middleware to update features based on subscription plan
cafeSchema.pre('save', function(next) {
  if (this.isModified('subscription.planType')) {
    this.updateFeaturesForPlan(this.subscription.planType);
  }
  
  // Set default operating hours if not set
  if (!this.settings.operatingHours.monday.open) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => {
      this.settings.operatingHours[day] = {
        open: '09:00',
        close: '22:00',
        isOpen: true
      };
    });
  }
  
  next();
});

const Cafe = mongoose.model('Cafe', cafeSchema);
export default Cafe;
