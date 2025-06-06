// server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // ✅ Check if the header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // ✅ Split to get the token
      token = req.headers.authorization.split(' ')[1];

      console.log('🔐 JWT_SECRET:', process.env.JWT_SECRET);


      // ✅ Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ Attach user to request
      req.user = await User.findById(decoded.id).select('-password');

      next(); // ✅ Move to next middleware
    } catch (err) {
         console.error('JWT Verification Error:', err.message);
      res.status(401).json({ message: 'Token failed' });
    }
  } else {
    res.status(401).json({ message: 'No token provided' });
  }
};


export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
