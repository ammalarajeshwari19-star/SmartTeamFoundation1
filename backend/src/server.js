import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import matchingRoutes from './routes/matchingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { initializeDatabase } from './database/schema.js';
import { seedDatabase } from './database/seed.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Security & utility middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    application: 'SmartTeamFoundation API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount modular API routers
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/projects/:id/members', memberRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize DB and start server
async function startServer() {
  try {
    await initializeDatabase();
    await seedDatabase();

    const server = app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 SmartTeamFoundation Backend running on port ${PORT}`);
      console.log(`   Health Check: http://localhost:${PORT}/api/health`);
      console.log(`======================================================\n`);
    });

    return server;
  } catch (err) {
    console.error('Fatal error starting SmartTeamFoundation backend:', err);
    process.exit(1);
  }
}

// Only start when run directly
if (process.argv[1]?.endsWith('server.js')) {
  startServer();
}

export { app, startServer };
