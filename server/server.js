// server/server.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import menuRoutes from './routes/menuRoutes.js'; 
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import authRoutes from './routes/authRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import cafeRoutes from './routes/cafeRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import themeRoutes from './routes/themeRoutes.js';
import printerRoutes from './routes/printerRoutes.js';

import publicRoutes from './routes/publicRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { startSubscriptionCron } from './jobs/subscriptionCron.js';

dotenv.config();

const app = express();
const server = createServer(app);

// Enhanced Socket.IO configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});


const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// Routes
app.get('/', (req, res) => {
  res.send('DineFlow backend is running!');
});

app.use('/api/menu', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cafes', cafeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/theme', themeRoutes);
app.use('/api/printer', printerRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/health', healthRoutes);

// Enhanced Socket.IO logic
io.on('connection', (socket) => {
  console.log(`🟢 User connected: ${socket.id}`);
  
  // Join cafe room when authenticated
  socket.on('joinCafeRoom', (cafeId) => {
    if (!cafeId) {
      console.warn('No cafeId provided for room join');
      return;
    }
    socket.join(`cafe-${cafeId}`);
    console.log(`Socket ${socket.id} joined cafe room: cafe-${cafeId}`);
  });

  // Leave cafe room
  socket.on('leaveCafeRoom', (cafeId) => {
    if (!cafeId) {
      console.warn('No cafeId provided for room leave');
      return;
    }
    socket.leave(`cafe-${cafeId}`);
    console.log(`Socket ${socket.id} left cafe room: cafe-${cafeId}`);
  });

  // Test event handlers for development
  socket.on('testNotification', (data) => {
    if (data.cafeId) {
      io.to(`cafe-${data.cafeId}`).emit(data.event, data.data);
    }
  });

  socket.on('testMenuCreated', (data) => {
    if (data.cafeId) {
      io.to(`cafe-${data.cafeId}`).emit('menuCreated', data.data);
    }
  });

  socket.on('testMenuUpdated', (data) => {
    if (data.cafeId) {
      io.to(`cafe-${data.cafeId}`).emit('menuUpdated', data.data);
    }
  });

  socket.on('testMenuDeleted', (data) => {
    if (data.cafeId) {
      io.to(`cafe-${data.cafeId}`).emit('menuDeleted', data.data);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
  });

  // Error handling
  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

// Make io available to routes
app.set('io', io);

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
  
  // Start subscription expiry cron job
  startSubscriptionCron();
});