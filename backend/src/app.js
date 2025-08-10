const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');

const subscriptionRoutes = require('./routes/subscriptions');
const nodeRoutes = require('./routes/nodes');
const exportRoutes = require('./routes/export');
const speedTestService = require('./services/speedTest');
const database = require('./utils/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/export', exportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize database
database.init();

// Schedule speed testing every 5 minutes
cron.schedule('*/5 * * * *', () => {
  console.log('Starting scheduled speed test...');
  speedTestService.runSpeedTest();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

module.exports = app;