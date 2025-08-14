// server/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { 
    type: String, 
    required: function() {
      return this.role === 'super-admin';
    },
    sparse: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['super-admin', 'admin', 'staff', 'cashier'],
    default: 'admin',
  },
  
  // Link user to a specific cafe (null for super_admin)
  cafeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe',
    required: function() {
      return this.role !== 'super-admin';
    },
    index: true
  },
  
  // User profile information
  profile: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phone: { type: String, trim: true },
    avatar: { type: String }, // URL to profile image
  },
  
  // User permissions and settings
  permissions: {
    canManageMenu: { type: Boolean, default: false },
    canManageOrders: { type: Boolean, default: true },
    canManageTables: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false },
    canManageSettings: { type: Boolean, default: false }
  },
  
  // Account status
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  
  // Password reset
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

// 🔐 Password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔑 Compare method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if user is super admin
userSchema.methods.isSuperAdmin = function() {
  return this.role === 'super-admin';
};

// Method to check if user is cafe admin
userSchema.methods.isCafeAdmin = function() {
  return this.role === 'cafe_admin';
};

// Method to check if user has specific permission
userSchema.methods.hasPermission = function(permission) {
  if (this.isSuperAdmin()) return true; // Super admin has all permissions
  return this.permissions && this.permissions[permission] === true;
};

// Method to get full name
userSchema.virtual('fullName').get(function() {
  if (this.profile && this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.username;
});

// Set default permissions based on role
userSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('role')) {
    switch (this.role) {
      case 'super-admin':
        this.permissions = {
          canManageMenu: true,
          canManageOrders: true,
          canManageTables: true,
          canViewAnalytics: true,
          canManageUsers: true,
          canManageSettings: true
        };
        break;
      case 'admin':
      case 'cafe_admin':
        this.permissions = {
          canManageMenu: true,
          canManageOrders: true,
          canManageTables: true,
          canViewAnalytics: true,
          canManageUsers: true,
          canManageSettings: true
        };
        break;
      case 'kitchen':
        this.permissions = {
          canManageMenu: false,
          canManageOrders: true,
          canManageTables: false,
          canViewAnalytics: false,
          canManageUsers: false,
          canManageSettings: false
        };
        break;
      case 'waiter':
        this.permissions = {
          canManageMenu: false,
          canManageOrders: true,
          canManageTables: true,
          canViewAnalytics: false,
          canManageUsers: false,
          canManageSettings: false
        };
        break;
    }
  }
  next();
});

// Indexes for better performance
userSchema.index({ cafeId: 1, role: 1 });
userSchema.index({ username: 1, cafeId: 1 }, { unique: true });
userSchema.index({ email: 1 }, { sparse: true });

const User = mongoose.model('User', userSchema);
export default User;
