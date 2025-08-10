const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const Node = require('../models/Node');
const SubscriptionParser = require('../services/subscriptionParser');

// Get all subscriptions
router.get('/', async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll();
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subscription by ID
router.get('/:id', async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new subscription
router.post('/', async (req, res) => {
  try {
    const { name, url, type } = req.body;
    
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }

    // Parse subscription to get nodes and expiry
    const parseResult = await SubscriptionParser.parseSubscription(url, type);
    
    // Check if subscription has expired
    if (parseResult.expires_at && new Date(parseResult.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Subscription has expired' });
    }

    // Create subscription
    const subscription = await Subscription.create({
      name,
      url,
      type: type || 'auto',
      expires_at: parseResult.expires_at
    });

    // Add nodes from subscription
    const nodes = [];
    for (const nodeData of parseResult.nodes) {
      const node = await Node.create({
        ...nodeData,
        subscription_id: subscription.id
      });
      nodes.push(node);
    }

    res.status(201).json({
      subscription,
      nodes: nodes.length,
      message: `Subscription created with ${nodes.length} nodes`
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update subscription
router.put('/:id', async (req, res) => {
  try {
    const { name, url, type } = req.body;
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    await Subscription.update(req.params.id, {
      name: name || subscription.name,
      url: url || subscription.url,
      type: type || subscription.type,
      expires_at: subscription.expires_at,
      last_checked: new Date().toISOString()
    });

    res.json({ message: 'Subscription updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete subscription
router.delete('/:id', async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    await Subscription.delete(req.params.id);
    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refresh subscription (re-parse and update nodes)
router.post('/:id/refresh', async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Parse subscription again
    const parseResult = await SubscriptionParser.parseSubscription(
      subscription.url, 
      subscription.type
    );

    // Check if subscription has expired
    if (parseResult.expires_at && new Date(parseResult.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Subscription has expired' });
    }

    // Deactivate old nodes from this subscription
    const oldNodes = await Node.findBySubscription(req.params.id);
    for (const node of oldNodes) {
      await Node.delete(node.id);
    }

    // Add new nodes
    const nodes = [];
    for (const nodeData of parseResult.nodes) {
      const node = await Node.create({
        ...nodeData,
        subscription_id: req.params.id
      });
      nodes.push(node);
    }

    // Update subscription
    await Subscription.update(req.params.id, {
      ...subscription,
      expires_at: parseResult.expires_at,
      last_checked: new Date().toISOString()
    });

    res.json({
      message: `Subscription refreshed with ${nodes.length} nodes`,
      nodes: nodes.length
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get subscription statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Subscription.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;