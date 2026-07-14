import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
import { corsOptions } from './middleware/validation.js';
import { requestLogger } from './middleware/validation.js';
import errorHandler, { notFoundHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';
import { createRateLimiter } from './middleware/validation.js';
import authRoutes from './routes/authRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
// import videoRoutes from './routes/videoRoutes.js';
import { logger } from './utils/logger.js';
import { CONSTANTS } from './config/constants.js';
import prisma from './config/database.js';

// Load environment variables
dotenv.config();

// ============================================
// APP INITIALIZATION
// ============================================

const app = express();
const httpServer = createServer(app);

// ============================================
// SOCKET.IO SETUP
// ============================================

const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/socket.io',
  transports: ['websocket', 'polling'],
});

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: true,
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
}));

// CORS
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Rate limiting
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: CONSTANTS.RATE_LIMIT.AUTH_MAX_REQUESTS,
  message: 'Too many authentication attempts, please try again later.',
});

app.use('/api/auth', authLimiter);

const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: CONSTANTS.RATE_LIMIT.MAX_REQUESTS,
});

app.use('/api', generalLimiter);

// Health check endpoint (no rate limit)
app.get('/health', async (req, res) => {
  const dbHealth = await prisma.healthCheck();
  
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbHealth ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// ============================================
// ROUTES
// ============================================

// Public routes
app.use('/api/auth', authLimiter, authRoutes);

// Protected routes
app.use('/api/appointments', authenticate, appointmentRoutes);
app.use('/api/patients', authenticate, patientRoutes);
app.use('/api/providers', providerRoutes);
// app.use('/api/video', authenticate, videoRoutes);

// ============================================
// SOCKET.IO EVENTS
// ============================================

io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
  
  if (!token) {
    const err = new Error('Authentication required');
    return next(err);
  }

  try {
    // Verify token here
    // For simplicity, we're accepting the token
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  const userId = socket.handshake.auth.userId;

  // Join user's room
  if (userId) {
    socket.join(`user:${userId}`);
    logger.debug(`User ${userId} joined their room`);
  }

  // ============================================
  // VIDEO CONSULTATION EVENTS
  // ============================================

  socket.on('join-room', (data: { roomId: string; userId: string }) => {
    const { roomId, userId } = data;
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', { userId, socketId: socket.id });
    logger.info(`User ${userId} joined room ${roomId}`);
  });

  socket.on('leave-room', (data: { roomId: string; userId: string }) => {
    const { roomId, userId } = data;
    socket.leave(roomId);
    socket.to(roomId).emit('user-disconnected', { userId, socketId: socket.id });
    logger.info(`User ${userId} left room ${roomId}`);
  });

  // ============================================
  // WEBRTC SIGNALING
  // ============================================

  socket.on('video-offer', (data: { 
    roomId: string; 
    offer: RTCSessionDescriptionInit; 
    from: string; 
    to: string 
  }) => {
    const { roomId, offer, from, to } = data;
    socket.to(roomId).emit('video-offer', { offer, from, to });
    logger.debug(`Video offer from ${from} to ${to} in room ${roomId}`);
  });

  socket.on('video-answer', (data: { 
    roomId: string; 
    answer: RTCSessionDescriptionInit; 
    from: string; 
    to: string 
  }) => {
    const { roomId, answer, from, to } = data;
    socket.to(roomId).emit('video-answer', { answer, from, to });
    logger.debug(`Video answer from ${from} to ${to} in room ${roomId}`);
  });

  socket.on('ice-candidate', (data: { 
    roomId: string; 
    candidate: RTCIceCandidateInit; 
    from: string; 
    to: string 
  }) => {
    const { roomId, candidate, from, to } = data;
    socket.to(roomId).emit('ice-candidate', { candidate, from, to });
    logger.debug(`ICE candidate from ${from} to ${to} in room ${roomId}`);
  });

  // ============================================
  // CHAT EVENTS
  // ============================================

  socket.on('chat-message', (data: {
    roomId: string;
    userId: string;
    message: string;
    timestamp: string;
  }) => {
    const { roomId, userId, message, timestamp } = data;
    socket.to(roomId).emit('chat-message', {
      userId,
      message,
      timestamp,
      sender: socket.id,
    });
    logger.debug(`Chat message in room ${roomId} from ${userId}`);
  });

  // ============================================
  // PRESENCE EVENTS
  // ============================================

  socket.on('typing', (data: { roomId: string; userId: string; isTyping: boolean }) => {
    const { roomId, userId, isTyping } = data;
    socket.to(roomId).emit('user-typing', { userId, isTyping });
  });

  // ============================================
  // DISCONNECT
  // ============================================

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
    // Notify all rooms user has left
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      if (room !== socket.id) {
        socket.to(room).emit('user-disconnected', {
          userId: socket.handshake.auth.userId,
          socketId: socket.id,
        });
      }
    });
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 API URL: http://localhost:${PORT}/api`);
  logger.info(`💚 Health check: http://localhost:${PORT}/health`);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const shutdown = async (signal: string) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);
  
  // Close HTTP server
  httpServer.close(async () => {
    logger.info('HTTP server closed');
    
    // Disconnect database
    await prisma.$disconnect();
    logger.info('Database disconnected');
    
    // Exit process
    process.exit(0);
  });

  // Force exit after timeout
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export { app, io, httpServer };