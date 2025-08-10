const express = require('express');
const router = express.Router();
const Node = require('../models/Node');
const SpeedTestService = require('../services/speedTest');

// Get all nodes
router.get('/', async (req, res) => {
  try {
    const nodes = await Node.findAll();
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active nodes (with latency data)
router.get('/active', async (req, res) => {
  try {
    const nodes = await Node.findActive();
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top performing nodes
router.get('/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const nodes = await Node.findTopPerforming(limit);
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new node manually
router.post('/', async (req, res) => {
  try {
    const { name, type, config, source } = req.body;
    
    if (!name || !type || !config) {
      return res.status(400).json({ error: 'Name, type, and config are required' });
    }

    const node = await Node.create({
      name,
      type,
      config,
      subscription_id: null,
      source: source || 'manual'
    });

    res.status(201).json(node);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete node
router.delete('/:id', async (req, res) => {
  try {
    await Node.delete(req.params.id);
    res.json({ message: 'Node deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test single node
router.post('/:id/test', async (req, res) => {
  try {
    const result = await SpeedTestService.testSingleNode(parseInt(req.params.id));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger speed test for all nodes
router.post('/test-all', async (req, res) => {
  try {
    // Run speed test asynchronously
    SpeedTestService.runSpeedTest().catch(console.error);
    res.json({ message: 'Speed test started for all nodes' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get node statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Node.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get nodes by subscription
router.get('/subscription/:subscriptionId', async (req, res) => {
  try {
    const nodes = await Node.findBySubscription(req.params.subscriptionId);
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;