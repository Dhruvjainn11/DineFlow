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
dotenv.config();

const app = express();
const server = createServer(app);

// Enhanced Socket.IO configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  // Additional performance options
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
app.use('/api/public', (await import('./routes/publicRoutes.js')).default);

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
});