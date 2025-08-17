// server/models/Table.js
import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    cafeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cafe',
      required: true,
      index: true
    },
    tableNumber: { type: Number, required: true },
    tableName: { type: String, trim: true }, // Optional custom name like "Window Table"
    
    // QR Code details
    qrCode: { type: String }, // Base64 or URL to QR code image
    qrCodeUrl: { type: String }, // URL that the QR code points to
    qrCodeType: {
      type: String,
      enum: ['basic', 'premium'],
      default: 'basic'
    },
    
    status: {
      type: String,
      enum: ["Available", "Occupied", "Reserved", "Maintenance"],
      default: "Available",
    },
    
    // Table capacity and details
    capacity: {
      type: Number,
      default: 4,
      min: 1,
      max: 20
    },
    location: {
      type: String,
      trim: true // e.g., "Near window", "Garden area"
    },
    
    // Current order tracking
    currentOrder: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    }],
    
    // Reservation details
    reservedBy: {
      name: String,
      phone: String,
      reservedAt: Date,
      reservedUntil: Date
    },
    
    // Table settings
    isActive: {
      type: Boolean,
      default: true
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    
    // Analytics
    analytics: {
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      averageOrderValue: { type: Number, default: 0 },
      lastOrderDate: Date
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
tableSchema.index({ cafeId: 1, tableNumber: 1 }, { unique: true });
tableSchema.index({ cafeId: 1, status: 1 });
tableSchema.index({ cafeId: 1, isActive: 1 });
tableSchema.index({ cafeId: 1, sortOrder: 1 });

// Method to check if table is available
tableSchema.methods.isAvailable = function() {
  return this.status === 'Available' && this.isActive;
};

// Method to generate QR code URL based on cafe plan
tableSchema.methods.generateQRCodeUrl = function(cafe, baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173') {
  // Force local IP for development (when FRONTEND_URL contains IP address)
  if (process.env.FRONTEND_URL && process.env.FRONTEND_URL.includes('192.168')) {
    return `${baseUrl}/cafe/${this.cafeId}/table/${this._id}`;
  }
  
  // Pro plan with custom subdomain (only in production)
  if (cafe && cafe.features?.customDomain && cafe.subdomain) {
    return `https://${cafe.subdomain}.dineflow.com/cafe/${this.cafeId}/table/${this._id}`;
  }
  
  // Basic plan with path-based URL
  return `${baseUrl}/cafe/${this.cafeId}/table/${this._id}`;
};

// Method to get QR code data with plan-specific features
tableSchema.methods.getQRCodeData = function(cafe) {
  const isPremium = cafe?.features?.premiumQRCodes || false;
  const hasCustomBranding = cafe?.features?.customBranding || false;
  
  return {
    tableId: this._id,
    tableNumber: this.tableNumber,
    tableName: this.tableName,
    location: this.location,
    capacity: this.capacity,
    status: this.status,
    url: this.generateQRCodeUrl(cafe),
    isPremium,
    
    // QR Code styling based on plan
    styling: {
      primaryColor: isPremium ? (cafe.theme?.primaryColor || '#3B82F6') : '#000000',
      backgroundColor: '#FFFFFF',
      logoUrl: (isPremium && hasCustomBranding) ? cafe.theme?.logoUrl : null,
      errorCorrectionLevel: isPremium ? 'H' : 'M', // Higher correction for logo overlay
      size: isPremium ? 400 : 300,
      margin: isPremium ? 2 : 1
    },
    
    // Branding information
    branding: {
      cafeName: cafe?.name || 'DineFlow',
      isWhiteLabel: cafe?.features?.whiteLabel || false,
      customDomain: cafe?.subdomain || null
    },
    
    // Instructions for printing
    instructions: {
      title: isPremium ? `Scan to Order at ${cafe?.name || 'Restaurant'}` : 'Scan to Order',
      subtitle: 'Scan with your phone camera to view menu and place order',
      footer: isPremium && cafe?.features?.whiteLabel ? 
        `Powered by ${cafe.name}` : 
        'Powered by DineFlow'
    }
  };
};


// Inside methods
tableSchema.methods.getQrCodeOptions = function(cafe, overrides = {}) {
  const qrData = this.getQRCodeData(cafe);
  return {
    errorCorrectionLevel: qrData.styling.errorCorrectionLevel,
    type: 'image/png',
    quality: 0.92,
    margin: qrData.styling.margin,
    color: {
      dark: qrData.styling.primaryColor,
      light: qrData.styling.backgroundColor
    },
    width: qrData.styling.size,
    ...overrides // allow route-specific overrides like ?size=300
  };
};


// Method to update QR analytics (Pro feature)
tableSchema.methods.updateQRAnalytics = async function(scanData = {}) {
  if (!this.qrAnalytics) {
    this.qrAnalytics = {
      totalScans: 0,
      scansToday: 0,
      lastScanned: null,
      scanHistory: []
    };
  }
  
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  // Reset daily count if it's a new day
  if (!this.qrAnalytics.lastScanned || this.qrAnalytics.lastScanned < todayStart) {
    this.qrAnalytics.scansToday = 0;
  }
  
  // Update scan counts
  this.qrAnalytics.totalScans += 1;
  this.qrAnalytics.scansToday += 1;
  this.qrAnalytics.lastScanned = today;
  
  // Store scan data (for Pro analytics)
  if (scanData.userAgent || scanData.ipAddress) {
    this.qrAnalytics.scanHistory = this.qrAnalytics.scanHistory || [];
    this.qrAnalytics.scanHistory.push({
      timestamp: today,
      userAgent: scanData.userAgent,
      ipAddress: scanData.ipAddress,
      referrer: scanData.referrer
    });
    
    // Keep only last 30 days of scan history
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    this.qrAnalytics.scanHistory = this.qrAnalytics.scanHistory.filter(
      scan => scan.timestamp > thirtyDaysAgo
    );
  }
  
  return this.save();
};

// Method to get QR analytics summary
tableSchema.methods.getQRAnalyticsSummary = function(days = 7) {
  if (!this.qrAnalytics) {
    return {
      totalScans: 0,
      scansToday: 0,
      averageScansPerDay: 0,
      lastScanned: null,
      recentScans: []
    };
  }
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentScans = this.qrAnalytics.scanHistory?.filter(
    scan => scan.timestamp > cutoffDate
  ) || [];
  
  return {
    totalScans: this.qrAnalytics.totalScans || 0,
    scansToday: this.qrAnalytics.scansToday || 0,
    averageScansPerDay: Math.round((recentScans.length || 0) / days),
    lastScanned: this.qrAnalytics.lastScanned,
    recentScans: recentScans.length,
    scanTrend: this.calculateScanTrend(days)
  };
};

// Helper method to calculate scan trend
tableSchema.methods.calculateScanTrend = function(days = 7) {
  if (!this.qrAnalytics?.scanHistory) return 'stable';
  
  const now = new Date();
  const halfPeriod = Math.floor(days / 2);
  
  const recentDate = new Date(now.getTime() - (halfPeriod * 24 * 60 * 60 * 1000));
  const olderDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  
  const recentScans = this.qrAnalytics.scanHistory.filter(
    scan => scan.timestamp > recentDate
  ).length;
  
  const olderScans = this.qrAnalytics.scanHistory.filter(
    scan => scan.timestamp > olderDate && scan.timestamp <= recentDate
  ).length;
  
  if (recentScans > olderScans * 1.2) return 'increasing';
  if (recentScans < olderScans * 0.8) return 'decreasing';
  return 'stable';
};

// Method to update analytics
tableSchema.methods.updateAnalytics = function(orderValue) {
  this.analytics.totalOrders += 1;
  this.analytics.totalRevenue += orderValue;
  this.analytics.averageOrderValue = this.analytics.totalRevenue / this.analytics.totalOrders;
  this.analytics.lastOrderDate = new Date();
};

// Virtual for display name
tableSchema.virtual('displayName').get(function() {
  if (this.tableName) {
    return `${this.tableName} (Table ${this.tableNumber})`;
  }
  return `Table ${this.tableNumber}`;
});

const Table = mongoose.model("Table", tableSchema);
export default Table;
