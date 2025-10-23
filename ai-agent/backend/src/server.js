import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import agentRoutes from './routes/agent.js';
import supervisorRoutes from './routes/supervisor.js';
import HelpRequestService from './services/helpRequestService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/agent', agentRoutes);
app.use('/api/supervisor', supervisorRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Background job to expire old requests (runs every 5 minutes)
setInterval(async () => {
  try {
    await HelpRequestService.expireOldRequests();
  } catch (error) {
    console.error('Error in background job:', error);
  }
}, 5 * 60 * 1000);

// Start server
app.listen(PORT, () => {
  console.log('========================================');
  console.log(`🚀 Frontdesk AI Agent Server Running`);
  console.log('========================================');
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log('========================================\n');
});