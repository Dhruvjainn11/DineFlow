// server/routes/authRoutes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from "bcryptjs";
import Cafe from "../models/Cafe.js";

import { validateLogin } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password, cafeId } = req.body;

    // Basic validation is now handled by validateLogin middleware

    // For super admin, don't require cafeId
    let query = { username, isActive: true };
    if (cafeId) {
      query.cafeId = cafeId;
    }

    // Find user and populate cafe details
    const user = await User.findOne(query)
      .populate('cafeId', 'name subdomain features subscription theme settings status');
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account has been deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // For non-super admin users, check cafe status
    if (user.cafeId && user.cafeId.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Cafe account is suspended',
        code: 'CAFE_SUSPENDED'
      });
    }

    // Check subscription status for cafe users
    if (user.cafeId && user.cafeId.subscription) {
      const subscription = user.cafeId.subscription;
      const now = new Date();
      
      if (subscription.status === 'trial' && subscription.trialEndDate < now) {
        return res.status(403).json({ 
          success: false, 
          message: 'Trial period has expired. Please upgrade your subscription.',
          code: 'TRIAL_EXPIRED'
        });
      }
      
      if (subscription.status === 'active' && subscription.endDate < now) {
        return res.status(403).json({ 
          success: false, 
          message: 'Subscription has expired. Please renew your subscription.',
          code: 'SUBSCRIPTION_EXPIRED'
        });
      }
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        role: user.role,
        cafeId: user.cafeId?._id,
        permissions: user.permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Update last login
    user.lastLogin = new Date();
    user.loginAttempts = 0; // Reset login attempts on successful login
    await user.save();

    // Prepare response data
    const responseData = {
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        profile: user.profile,
        permissions: user.permissions,
        fullName: user.fullName
      }
    };

    // Add cafe details if user is associated with a cafe
    if (user.cafeId) {
      responseData.cafe = {
        id: user.cafeId._id,
        name: user.cafeId.name,
        subdomain: user.cafeId.subdomain,
        features: user.cafeId.features,
        theme: user.cafeId.theme,
        settings: user.cafeId.settings,
        subscription: {
          planType: user.cafeId.subscription.planType,
          status: user.cafeId.subscription.status,
          trialEndDate: user.cafeId.subscription.trialEndDate,
          endDate: user.cafeId.subscription.endDate
        }
      };
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: responseData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
router.post("/login/super-admin", async (req, res) => {
  console.log("LOGIN ATTEMPT:", req.body);
  try {
    const { username, password } = req.body;

  

    // 1. Validate
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // 2. Find user
    const user = await User.findOne({
      $or: [{ email: username }, { username }]
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // 3. Check if active
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Contact support.",
      });
    }

    console.log("USER:", user);
    console.log("PASSWORD:", password);
    console.log("USER PASSWORD:", user.password);

    // 4. Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // 5. Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
        cafeId: user.cafeId || null,
        permissions: user.permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6. Attach cafe data if user is admin of a cafe
    let cafeData = null;
    if (user.cafeId) {
      cafeData = await Cafe.findById(user.cafeId).lean();
    }

    // 7. Remove password before sending
    delete user.password;

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user,
        cafe: cafeData || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});


export default router;
