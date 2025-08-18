// server/routes/healthRoutes.js
import express from 'express';

const router = express.Router();

// @desc    Health check endpoint
// @route   GET /api/health
// @access  Public
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;